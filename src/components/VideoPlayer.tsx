"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface VideoPlayerProps {
  lessonId: string;
  videoPath: string;
}

export default function VideoPlayer({ lessonId, videoPath }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/video-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoPath, lessonId }),
        });

        if (!res.ok) {
          setError("ไม่สามารถโหลดวิดีโอได้");
          return;
        }

        const data = await res.json();
        setVideoUrl(data.url);
      } catch {
        setError("เกิดข้อผิดพลาดในการโหลดวิดีโอ");
      }
    }

    fetchToken();
  }, [videoPath]);

  // Track progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const saveProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !video.duration) return;

      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      const isCompleted = currentTime >= duration * 0.9;

      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          actual_watch_seconds: currentTime,
          last_watched_position: currentTime,
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );
    };

    const interval = setInterval(saveProgress, 30000);
    video.addEventListener("pause", saveProgress);
    video.addEventListener("ended", saveProgress);

    return () => {
      clearInterval(interval);
      video.removeEventListener("pause", saveProgress);
      video.removeEventListener("ended", saveProgress);
    };
  }, [lessonId, supabase]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      playsInline
      className="w-full h-full"
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
