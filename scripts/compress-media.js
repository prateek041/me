const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const crypto = require("crypto");

// Configuration
const CONFIG = {
  publicDir: path.join(process.cwd(), "public"),
  compressionManifestPath: path.join(
    process.cwd(),
    ".compression-manifest.json",
  ),
  maxImageSize: 1024 * 1024, // 1MB
  maxAudioSize: 3 * 1024 * 1024, // 2MB
  minAudioBitrate: 32, // Minimum bitrate in kbps
  maxAudioBitrate: 128, // Maximum bitrate in kbps
  minAudioDuration: 60, // Minimum duration in seconds (1 minute)
};

// Utility functions remain the same
function calculateFileHash(filepath) {
  const content = fs.readFileSync(filepath);
  return crypto.createHash("md5").update(content).digest("hex");
}

function getFileSize(filepath) {
  const stats = fs.statSync(filepath);
  return stats.size;
}

function getAudioDuration(filepath) {
  try {
    const result = execSync(
      `ffprobe -i "${filepath}" -show_entries format=duration -v quiet -of csv="p=0"`,
      { encoding: "utf8" },
    );
    return parseFloat(result.trim());
  } catch (error) {
    console.error("Error getting audio duration:", error);
    return null;
  }
}

// Load or create compression manifest
function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.compressionManifestPath, "utf-8"));
  } catch {
    return {};
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(
    CONFIG.compressionManifestPath,
    JSON.stringify(manifest, null, 2),
  );
}

// Check if FFmpeg is installed
function checkFFmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    execSync("ffprobe -version", { stdio: "ignore" });
  } catch {
    console.error("FFmpeg and FFprobe are required but not installed.");
    console.log("Please install FFmpeg:");
    console.log("- Mac: brew install ffmpeg");
    console.log("- Ubuntu/Debian: sudo apt-get install ffmpeg");
    console.log("- Windows: choco install ffmpeg");
    process.exit(1);
  }
}

function compressImage(filepath) {
  console.log(`\nCompressing image: ${filepath}`);
  const originalSize = getFileSize(filepath);
  console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

  const tempPath = `${filepath}.temp.jpg`;

  try {
    let quality = 80;
    let currentSize = Infinity;

    while (quality >= 20 && currentSize > CONFIG.maxImageSize) {
      const command = `ffmpeg -y -i "${filepath}" -vf "scale='min(1920,iw)':min'(1080,ih)':force_original_aspect_ratio=decrease" -quality ${quality} -compression_level 9 "${tempPath}"`;

      try {
        execSync(command, { stdio: "pipe" });
        currentSize = getFileSize(tempPath);
        console.log(
          `Tried quality ${quality}: ${(currentSize / 1024 / 1024).toFixed(2)}MB`,
        );

        if (currentSize <= CONFIG.maxImageSize) {
          fs.renameSync(tempPath, filepath);
          console.log(
            `Successfully compressed to ${(currentSize / 1024 / 1024).toFixed(2)}MB`,
          );
          return;
        }

        quality -= 10;
      } catch (error) {
        console.error(
          `Error during compression attempt with quality ${quality}:`,
          error,
        );
        quality -= 10;
      }
    }

    throw new Error(
      "Could not compress image to target size even with lowest quality",
    );
  } catch (error) {
    console.error("Error compressing image:", error);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

function compressAudio(filepath) {
  console.log(`\nCompressing audio: ${filepath}`);
  const originalSize = getFileSize(filepath);
  const originalDuration = getAudioDuration(filepath);
  console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Original duration: ${originalDuration.toFixed(2)} seconds`);

  const tempPath = `${filepath}.temp.mp3`;

  try {
    let currentSize = Infinity;
    let duration = originalDuration;

    // First attempt: Try different bitrates with full duration
    for (
      let bitrate = CONFIG.maxAudioBitrate;
      bitrate >= CONFIG.minAudioBitrate;
      bitrate = Math.floor(bitrate * 0.75)
    ) {
      console.log(`\nTrying bitrate ${bitrate}k with full duration...`);

      const command = `ffmpeg -y -i "${filepath}" -b:a ${bitrate}k -acodec libmp3lame "${tempPath}"`;

      try {
        execSync(command, { stdio: "pipe" });
        currentSize = getFileSize(tempPath);
        console.log(
          `Size with ${bitrate}k: ${(currentSize / 1024 / 1024).toFixed(2)}MB`,
        );

        if (currentSize <= CONFIG.maxAudioSize) {
          fs.renameSync(tempPath, filepath);
          console.log(
            `Successfully compressed with full duration at ${bitrate}k bitrate`,
          );
          return;
        }
      } catch (error) {
        console.error(`Error during bitrate compression attempt:`, error);
        continue;
      }
    }

    // Second attempt: If file is still too large, start reducing duration while cycling through bitrates
    console.log("\nStarting duration reduction with quality priority...");

    while (duration >= CONFIG.minAudioDuration) {
      // Try each bitrate at current duration, starting from highest
      for (
        let bitrate = CONFIG.maxAudioBitrate;
        bitrate >= CONFIG.minAudioBitrate;
        bitrate = Math.floor(bitrate * 0.75)
      ) {
        console.log(
          `\nTrying bitrate ${bitrate}k with duration ${duration.toFixed(2)}s...`,
        );

        const command = `ffmpeg -y -i "${filepath}" -t ${duration} -b:a ${bitrate}k -acodec libmp3lame "${tempPath}"`;

        try {
          execSync(command, { stdio: "pipe" });
          currentSize = getFileSize(tempPath);
          console.log(`Size: ${(currentSize / 1024 / 1024).toFixed(2)}MB`);

          if (currentSize <= CONFIG.maxAudioSize) {
            fs.renameSync(tempPath, filepath);
            const finalDuration = getAudioDuration(filepath);
            console.log(
              `Successfully compressed to ${(currentSize / 1024 / 1024).toFixed(2)}MB`,
            );
            console.log(
              `Final duration: ${finalDuration.toFixed(2)} seconds with ${bitrate}k bitrate`,
            );
            return;
          }
        } catch (error) {
          console.error(`Error during compression attempt:`, error);
          continue;
        }
      }

      // Reduce duration by 10% for next iteration
      duration = Math.max(duration * 0.9, CONFIG.minAudioDuration);

      // If we've hit minimum duration and still can't compress enough, give up
      if (
        duration === CONFIG.minAudioDuration &&
        currentSize > CONFIG.maxAudioSize
      ) {
        throw new Error(
          "Could not compress audio to target size even with minimum duration and bitrate",
        );
      }
    }
  } catch (error) {
    console.error("Error compressing audio:", error);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

// Main compression logic
function processFile(filepath, manifest) {
  const fileHash = calculateFileHash(filepath);
  const fileSize = getFileSize(filepath);
  const ext = path.extname(filepath).toLowerCase();

  // Check if file needs compression
  const existingRecord = manifest[filepath];
  if (existingRecord && existingRecord.hash === fileHash) {
    console.log(`\nSkipping ${filepath} - already processed`);
    return;
  }

  const needsCompression =
    ((ext === ".jpg" || ext === ".jpeg") && fileSize > CONFIG.maxImageSize) ||
    (ext === ".mp3" && fileSize > CONFIG.maxAudioSize);

  if (!needsCompression) {
    console.log(`\nSkipping ${filepath} - size within limits`);
    return;
  }

  try {
    if (ext === ".jpg" || ext === ".jpeg") {
      compressImage(filepath);
    } else if (ext === ".mp3") {
      compressAudio(filepath);
    }

    const newSize = getFileSize(filepath);
    manifest[filepath] = {
      hash: calculateFileHash(filepath),
      lastCompressed: new Date().toISOString(),
      originalSize: fileSize,
      compressedSize: newSize,
    };
  } catch (error) {
    console.error(`Failed to process ${filepath}:`, error);
  }
}

// Main function
function compressMediaFiles() {
  console.log("Starting media compression...");
  checkFFmpeg();

  const manifest = loadManifest();

  const files = fs.readdirSync(CONFIG.publicDir);
  for (const file of files) {
    const filepath = path.join(CONFIG.publicDir, file);
    const ext = path.extname(file).toLowerCase();

    if ([".jpg", ".jpeg", ".mp3"].includes(ext)) {
      processFile(filepath, manifest);
    }
  }

  saveManifest(manifest);
  console.log("\nCompression completed!");
}

compressMediaFiles();
