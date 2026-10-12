"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { spotlight } from "@/lib/brand";
import { FadeIn } from "@/components/motion";
import { useSection } from "@/components/content-provider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Film,
} from "lucide-react";

/**
 * SpotlightSection — The cinematic showcase replacing the former logo moment.
 *
 * Features:
 *  - Content on top (eyebrow, high-impact heading, narrative description).
 *  - Full media (video or image) below, shown completely in intrinsic/16:9 ratio without cropping.
 *  - Admin option for video sound mode (muted or with sound).
 *  - Inline sound & play controls.
 *  - Dedicated button & overlay to launch full-screen theater modal player.
 */
export function SpotlightSection() {
  const { pick, isAr } = useI18n();
  const { bg, field } = useSection("home.spotlight");

  const label = pick(field("label", spotlight.label));
  const heading = pick(field("heading", spotlight.heading));
  const body = pick(field("body", spotlight.body));
  const ctaText = pick(field("cta", spotlight.cta));
  const cmsMutedSetting = field<boolean>("muted", true);
  // When admin sets video to muted (true), sound is strictly locked off — visitors cannot unmute
  const isStrictlySilent = cmsMutedSetting === true;

  // Resolved media source
  const isVideo = bg.type === "video" || (!bg.type && bg.url?.includes("/video/upload/"));
  const mediaUrl =
    bg.url ||
    "https://res.cloudinary.com/ai39ujhm/video/upload/echo/site/final.mp4";
  const posterUrl =
    bg.poster ||
    "https://res.cloudinary.com/ai39ujhm/image/upload/echo/site/posters/final.jpg";

  // Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(isStrictlySilent);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync mute state if CMS setting updates
  useEffect(() => {
    if (isStrictlySilent) {
      setIsMuted(true);
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    } else {
      setIsMuted(false);
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
    }
  }, [isStrictlySilent]);

  // Only decode and play video when near/in viewport to keep 60fps scrolling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { rootMargin: "150px", threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [mediaUrl]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleSound = () => {
    if (isStrictlySilent || !videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    // If unmuting and video was paused, start playback
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <section className="relative overflow-hidden bg-transparent py-28 sm:py-36">
      {/* Background ambient lighting — pure hardware-accelerated radial gradient without costly blur filters */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] max-w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full -z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(56,189,248,0.12) 0%, rgba(14,165,233,0.04) 45%, transparent 70%)",
          transform: "translate3d(0, 0, 0)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
        
        {/* 1. Content on top */}
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--echo-accent)/0.3)] bg-[hsl(var(--echo-accent)/0.12)] px-4 py-1.5">
              <Film className="h-3.5 w-3.5 text-[hsl(var(--echo-accent))]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-bright">
                {label}
              </span>
            </div>

            <h2 className="display-lg mt-6 text-bright text-balance">
              {heading}
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground text-balance max-w-2xl mx-auto">
              {body}
            </p>
          </FadeIn>
        </div>

        {/* 2. Media below (Shown in full) */}
        <div className="mt-12 sm:mt-16 mx-auto max-w-[1240px]">
          <FadeIn direction="none" delay={0.15}>
            <div
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-surface/90 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)]"
              style={{
                transform: "translate3d(0, 0, 0)",
                contain: "paint layout",
                backfaceVisibility: "hidden",
              }}
            >
              
              {/* Media Container: 16:9 full aspect ratio */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {isVideo ? (
                  <>
                    <video
                      ref={videoRef}
                      src={mediaUrl}
                      poster={posterUrl}
                      loop
                      playsInline
                      muted={isStrictlySilent || isMuted}
                      onVolumeChange={(e) => {
                        if (isStrictlySilent) {
                          const el = e.currentTarget;
                          el.muted = true;
                          el.volume = 0;
                        }
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="h-full w-full object-contain sm:object-cover"
                    />

                    {/* Subtle top & bottom vignette scrim */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Interactive overlay controls */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex items-center justify-between gap-4 z-10 transition-opacity duration-300">
                      
                      {/* Left: Play / Pause & (Conditional) Sound Toggle */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          aria-label={isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause") : (isAr ? "تشغيل" : "Play")}
                          className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full border border-white/20 bg-[hsl(var(--echo-base)/0.9)] text-white transition-all duration-300 hover:scale-105 hover:bg-[hsl(var(--echo-base)/1)] cursor-pointer"
                        >
                          {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                        </button>

                        {/* Sound Toggle is strictly hidden if admin configured video as silent */}
                        {!isStrictlySilent && (
                          <button
                            type="button"
                            onClick={toggleSound}
                            aria-label={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute") : (isAr ? "كتم الصوت" : "Mute")}
                            className="flex items-center gap-2 rounded-full border border-white/20 bg-[hsl(var(--echo-base)/0.9)] px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-[hsl(var(--echo-base)/1)] cursor-pointer"
                          >
                            {isMuted ? (
                              <>
                                <VolumeX size={16} className="text-muted-foreground" />
                                <span className="hidden sm:inline">{isAr ? "صامت (اضغط للتشغيل)" : "Muted"}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={16} className="text-[hsl(var(--echo-accent))]" />
                                <span className="hidden sm:inline">{isAr ? "الصوت مفعّل" : "Sound On"}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Right: Watch Full Film / Fullscreen Modal */}
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[hsl(var(--echo-accent))] px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[hsl(var(--echo-accent)/0.3)] transition-all duration-300 hover:scale-105 hover:bg-[hsl(var(--echo-accent)/0.9)] cursor-pointer"
                      >
                        <Maximize2 size={15} />
                        <span>{ctaText}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Image
                      src={mediaUrl}
                      alt={heading}
                      fill
                      sizes="(max-width: 1200px) 100vw, 1240px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute end-4 bottom-4 z-10">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--echo-accent))] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Maximize2 size={15} />
                        <span>{ctaText}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

      </div>

      {/* ── Fullscreen Cinema Modal Player ─────────────────────────────── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-2xl animate-in fade-in-0 duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="absolute top-5 end-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Modal player enclosure */}
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo ? (
              <video
                src={mediaUrl}
                poster={posterUrl}
                controls
                autoPlay
                muted={isStrictlySilent}
                onVolumeChange={(e) => {
                  if (isStrictlySilent) {
                    const el = e.currentTarget;
                    el.muted = true;
                    el.volume = 0;
                  }
                }}
                className="aspect-video w-full h-auto object-contain bg-black"
              />
            ) : (
              <div className="relative aspect-video w-full bg-black">
                <Image
                  src={mediaUrl}
                  alt={heading}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
