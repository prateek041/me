package main

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Config holds the application configuration
type Config struct {
	PublicDir               string
	CompressionManifestPath string
	MaxImageSize            int64
	MaxAudioSize            int64
	MinAudioBitrate         int
	MaxAudioBitrate         int
	MinAudioDuration        float64
}

// ManifestRecord represents a single file's compression record
type ManifestRecord struct {
	Hash           string    `json:"hash"`
	LastCompressed time.Time `json:"lastCompressed"`
	OriginalSize   int64     `json:"originalSize"`
	CompressedSize int64     `json:"compressedSize"`
}

// Manifest maps filenames to their compression records
type Manifest map[string]ManifestRecord

var config = Config{
	PublicDir:               filepath.Join(".", "public"),
	CompressionManifestPath: ".compression-manifest.json",
	MaxImageSize:            1024 * 1024,     // 1MB
	MaxAudioSize:            3 * 1024 * 1024, // 3MB
	MinAudioBitrate:         96,              // 32kbps
	MaxAudioBitrate:         128,             // 128kbps
	MinAudioDuration:        60,              // 1 minute
}

// calculateFileHash generates MD5 hash of file content
func calculateFileHash(filepath string) (string, error) {
	file, err := os.Open(filepath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}

// getFileSize returns the size of a file in bytes
func getFileSize(filepath string) (int64, error) {
	info, err := os.Stat(filepath)
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}

// getAudioDuration returns the duration of an audio file in seconds
func getAudioDuration(filepath string) (float64, error) {
	cmd := exec.Command("ffprobe",
		"-i", filepath,
		"-show_entries", "format=duration",
		"-v", "quiet",
		"-of", "csv=p=0")

	output, err := cmd.Output()
	if err != nil {
		return 0, err
	}

	return strconv.ParseFloat(strings.TrimSpace(string(output)), 64)
}

// loadManifest loads or creates the compression manifest
func loadManifest() (Manifest, error) {
	manifest := make(Manifest)

	data, err := os.ReadFile(config.CompressionManifestPath)
	if os.IsNotExist(err) {
		return manifest, nil
	} else if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, err
	}

	return manifest, nil
}

// saveManifest saves the compression manifest to disk
func saveManifest(manifest Manifest) error {
	data, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(config.CompressionManifestPath, data, 0644)
}

// checkFFmpeg verifies FFmpeg installation
func checkFFmpeg() error {
	cmds := []string{"ffmpeg", "ffprobe"}
	for _, cmd := range cmds {
		if _, err := exec.LookPath(cmd); err != nil {
			return fmt.Errorf("%s is required but not installed", cmd)
		}
	}
	return nil
}

// compressImage compresses a JPEG image
func compressImage(filepath string) error {
	log.Printf("Compressing image: %s", filepath)
	originalSize, err := getFileSize(filepath)
	if err != nil {
		return err
	}
	log.Printf("Original size: %.2fMB", float64(originalSize)/1024/1024)

	tempPath := filepath + ".temp.jpg"
	defer os.Remove(tempPath) // Clean up temp file

	quality := 80
	for quality >= 20 {
		cmd := exec.Command("ffmpeg", "-y",
			"-i", filepath,
			"-vf", "scale='min(1920,iw)':min'(1080,ih)':force_original_aspect_ratio=decrease",
			"-quality", strconv.Itoa(quality),
			"-compression_level", "9",
			tempPath)

		if err := cmd.Run(); err != nil {
			quality -= 10
			continue
		}

		currentSize, err := getFileSize(tempPath)
		if err != nil {
			return err
		}

		log.Printf("Tried quality %d: %.2fMB", quality, float64(currentSize)/1024/1024)

		if currentSize <= config.MaxImageSize {
			return os.Rename(tempPath, filepath)
		}

		quality -= 10
	}

	return fmt.Errorf("could not compress image to target size")
}

// compressAudio compresses an MP3 file
func compressAudio(filepath string) error {
	log.Printf("Compressing audio: %s", filepath)

	originalSize, err := getFileSize(filepath)
	if err != nil {
		return err
	}

	originalDuration, err := getAudioDuration(filepath)
	if err != nil {
		return err
	}

	log.Printf("Original size: %.2fMB", float64(originalSize)/1024/1024)
	log.Printf("Original duration: %.2fs", originalDuration)

	tempPath := filepath + ".temp.mp3"
	defer os.Remove(tempPath) // Clean up temp file

	// First attempt: Try different bitrates with full duration
	for bitrate := config.MaxAudioBitrate; bitrate >= config.MinAudioBitrate; bitrate = int(float64(bitrate) * 0.75) {
		log.Printf("\nTrying bitrate %dk with full duration...", bitrate)

		cmd := exec.Command("ffmpeg", "-y",
			"-i", filepath,
			"-b:a", fmt.Sprintf("%dk", bitrate),
			"-acodec", "libmp3lame",
			tempPath)

		if err := cmd.Run(); err != nil {
			continue
		}

		currentSize, err := getFileSize(tempPath)
		if err != nil {
			return err
		}

		log.Printf("Size with %dk: %.2fMB", bitrate, float64(currentSize)/1024/1024)

		if currentSize <= config.MaxAudioSize {
			return os.Rename(tempPath, filepath)
		}
	}

	// Second attempt: Reduce duration while cycling through bitrates
	log.Printf("\nStarting duration reduction with quality priority...")

	duration := originalDuration
	for duration >= config.MinAudioDuration {
		for bitrate := config.MaxAudioBitrate; bitrate >= config.MinAudioBitrate; bitrate = int(float64(bitrate) * 0.75) {
			log.Printf("\nTrying bitrate %dk with duration %.2fs...", bitrate, duration)

			cmd := exec.Command("ffmpeg", "-y",
				"-i", filepath,
				"-t", fmt.Sprintf("%.2f", duration),
				"-b:a", fmt.Sprintf("%dk", bitrate),
				"-acodec", "libmp3lame",
				tempPath)

			if err := cmd.Run(); err != nil {
				continue
			}

			currentSize, err := getFileSize(tempPath)
			if err != nil {
				return err
			}

			log.Printf("Size: %.2fMB", float64(currentSize)/1024/1024)

			if currentSize <= config.MaxAudioSize {
				return os.Rename(tempPath, filepath)
			}
		}

		duration = duration * 0.8
		if duration < config.MinAudioDuration {
			duration = config.MinAudioDuration
		}
	}

	return fmt.Errorf("could not compress audio to target size")
}

// processFile handles the compression of a single file
func processFile(filePath string, manifest Manifest) error {
	hash, err := calculateFileHash(filePath)
	if err != nil {
		return err
	}

	fileSize, err := getFileSize(filePath)
	if err != nil {
		return err
	}

	ext := strings.ToLower(filepath.Ext(filePath))

	// Check if file needs compression
	if record, exists := manifest[filePath]; exists && record.Hash == hash {
		log.Printf("\nSkipping %s - already processed", filePath)
		return nil
	}

	needsCompression := (ext == ".jpg" || ext == ".jpeg") && fileSize > config.MaxImageSize ||
		ext == ".mp3" && fileSize > config.MaxAudioSize

	if !needsCompression {
		log.Printf("\nSkipping %s - size within limits", filePath)
		return nil
	}

	var compressionErr error
	if ext == ".jpg" || ext == ".jpeg" {
		compressionErr = compressImage(filePath)
	} else if ext == ".mp3" {
		compressionErr = compressAudio(filePath)
	}

	if compressionErr != nil {
		return compressionErr
	}

	newSize, err := getFileSize(filePath)
	if err != nil {
		return err
	}

	manifest[filePath] = ManifestRecord{
		Hash:           hash,
		LastCompressed: time.Now(),
		OriginalSize:   fileSize,
		CompressedSize: newSize,
	}

	return nil
}

func main() {
	log.Println("Starting media compression...")

	if err := checkFFmpeg(); err != nil {
		log.Fatalf("FFmpeg check failed: %v", err)
	}

	manifest, err := loadManifest()
	if err != nil {
		log.Fatalf("Failed to load manifest: %v", err)
	}

	files, err := os.ReadDir(config.PublicDir)
	if err != nil {
		log.Fatalf("Failed to read directory: %v", err)
	}

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 4) // Limit concurrent operations
	manifestMutex := &sync.Mutex{}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		ext := strings.ToLower(filepath.Ext(file.Name()))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".mp3" {
			continue
		}

		wg.Add(1)
		go func(file os.DirEntry) {
			defer wg.Done()
			semaphore <- struct{}{}        // Acquire semaphore
			defer func() { <-semaphore }() // Release semaphore

			filepath := filepath.Join(config.PublicDir, file.Name())
			if err := processFile(filepath, manifest); err != nil {
				log.Printf("Error processing %s: %v", filepath, err)
				return
			}

			manifestMutex.Lock()
			if err := saveManifest(manifest); err != nil {
				log.Printf("Error saving manifest: %v", err)
			}
			manifestMutex.Unlock()
		}(file)
	}

	wg.Wait()
	log.Println("\nCompression completed!")
}
