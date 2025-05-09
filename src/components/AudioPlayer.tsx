"use client";

import React, { useState, useRef, useEffect } from "react";
import { CiPause1, CiPlay1 } from "react-icons/ci";
import { Button } from "./ui/button";

interface AudioPlayerProps {
  audioFile: string;
}

const formatFileName = (fileName: string): string => {
  const nameWithoutExtension =
    fileName.split("/").pop()?.split(".")[0] || fileName;
  const formattedName = nameWithoutExtension.replace(/[-_]/g, " ");
  return formattedName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioFile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    setTitle(formatFileName(audioFile));
  }, [audioFile]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <audio
        ref={audioRef}
        src={`/${audioFile}`}
        onEnded={() => setIsPlaying(false)}
        loop={true}
      />
      <Button
        onClick={togglePlay}
        size={"sm"}
        variant={"secondary"}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <CiPause1 className="w-6 h-6" />
        ) : (
          <CiPlay1 className="w-6 h-6" />
        )}
      </Button>

      {title && (
        <div className="w-32 overflow-hidden whitespace-nowrap relative rounded px-2">
          <div className="animate-marquee inline-block">
            {title}
            <span className="px-4">•</span>
            {title}
            <span className="px-4">•</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
