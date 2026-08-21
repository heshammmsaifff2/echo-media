"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Video that costs nothing until it is nearly on screen.
 *
 * The source files here are large (10–50MB), so `src` is deliberately not set
 * during render — it is attached only once the element approaches the viewport,
 * and ambient loops pause again the moment they leave.
 */
export function LazyVideo({
  src,
  poster,
  mode = "ambient",
  className,
  videoClassName,
  label,
}: {
  src: string;
  poster?: string;
  /** `ambient` = muted autoplay loop. `feature` = user presses play, with sound. */
  mode?: "ambient" | "feature";
  className?: string;
  videoClassName?: string;
  label?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const { isAr } = useI18n();

  // Attach the source only when the section is close to view.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Ambient loops should not burn decode time while off screen.
  useEffect(() => {
    if (mode !== "ambient" || !armed) return;
    const el = hostRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, armed]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const isAmbient = mode === "ambient";

  return (
    <div ref={hostRef} className={cn("relative overflow-hidden bg-surface", className)}>
      <video
        ref={videoRef}
        src={armed ? src : undefined}
        poster={poster}
        muted={isAmbient ? true : muted}
        loop={isAmbient}
        playsInline
        preload={armed ? "metadata" : "none"}
        autoPlay={isAmbient && armed}
        aria-label={label}
        className={cn("h-full w-full object-cover", videoClassName)}
      />

      {!isAmbient && (
        <>
          {/* Click anywhere on the frame to toggle playback. */}
          <button
            type="button"
            onClick={toggle}
            aria-label={
              playing
                ? isAr
                  ? "إيقاف مؤقت"
                  : "Pause"
                : isAr
                  ? "تشغيل"
                  : "Play"
            }
            className="absolute inset-0 grid place-items-center cursor-pointer group"
          >
            <span
              className={cn(
                "grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-black/35 backdrop-blur-md transition-all duration-300",
                "group-hover:scale-105 group-hover:border-white/50 group-hover:bg-black/50",
                playing && "opacity-0 group-hover:opacity-100"
              )}
            >
              {playing ? (
                <Pause size={26} className="text-white" />
              ) : (
                <Play size={26} className="ms-1 text-white" fill="currentColor" />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={
              muted ? (isAr ? "تشغيل الصوت" : "Unmute") : isAr ? "كتم الصوت" : "Mute"
            }
            className="absolute bottom-5 end-5 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/70 cursor-pointer"
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </>
      )}
    </div>
  );
}
