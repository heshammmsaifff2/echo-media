"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { style } from "@/lib/brand";
import { LazyVideo } from "@/components/lazy-video";
import { useSection } from "@/components/content-provider";
import { Play, X } from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  LineRevealInView,
} from "@/components/motion";

/**
 * The second component on the homepage: the brand film full-bleed, played with
 * sound. It fills the viewport and the visitor presses play to hear it.
 */
export function FilmSection() {
  const { isAr } = useI18n();
  const { bg, field } = useSection("home.film");
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const tag = field("tag", { en: "Selected Work", ar: "من أعمالنا" });
  const title = field("title", {
    en: "Intentional lighting. Crafted for impact.",
    ar: "إضاءة مدروسة. تصنع الفارق.",
  });

  const src = bg.type === "video" && bg.url ? bg.url : "https://res.cloudinary.com/ai39ujhm/video/upload/echo/site/final_2.mp4";
  const poster = bg.poster ?? "https://res.cloudinary.com/ai39ujhm/image/upload/echo/site/posters/final2.png";

  // Lock the page and allow Esc to close while the full player is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    videoRef.current?.play().catch(() => {});
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-black">
      {/* Muted preview loop behind the button. */}
      <LazyVideo
        src={src}
        poster={poster}
        mode="ambient"
        fit="contain"
        label={isAr ? "فيلم Echo" : "Echo brand film"}
        className="absolute inset-0 h-full w-full"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/40" />

      {/* The whole frame opens the full player. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={isAr ? "تشغيل الفيديو كاملاً" : "Play full video"}
        className="group absolute inset-0 z-[1] grid place-items-center cursor-pointer"
      >
        <span className="grid h-24 w-24 place-items-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-white/60 group-hover:bg-black/60">
          <Play size={34} className="ms-1 text-white" fill="currentColor" />
        </span>
      </button>

      {/* Title over the top of the frame. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] bg-gradient-to-b from-black/70 to-transparent">
        <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-28 sm:px-10 sm:pt-32">
          <span className="eyebrow text-bright/70">{isAr ? tag.ar : tag.en}</span>
          <h2 className="display-md mt-5 max-w-3xl text-bright drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
            {isAr ? title.ar : title.en}
          </h2>
        </div>
      </div>

      {/* Full-screen player — portalled to the body so the panel's scale
          transform doesn't reposition the fixed overlay. */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={isAr ? "إغلاق" : "Close"}
              className="absolute end-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
            >
              <X size={20} />
            </button>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-auto max-w-[95vw] rounded-lg shadow-2xl"
            />
          </div>,
          document.body
        )}
    </section>
  );
}

/**
 * The Echo style — the six things every film that leaves this house carries.
 * Shown as one oversized editorial line-up (no grid, no boxes): big numbered
 * words that read like a title sequence over the ambient loop.
 */
export function ShowreelSection() {
  const { pick } = useI18n();
  const { bg, field } = useSection("home.style");
  const steps = pick(field("steps", style.steps));
  const bandVideo = bg.type === "video" && bg.url ? bg.url : undefined;
  const bandImage = bg.type === "image" && bg.url ? bg.url : undefined;

  return (
    <section className="relative border-t border-border bg-background py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-14 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(field("label", style.label))}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg max-w-4xl text-bright">
          <LineRevealInView lines={[pick(field("heading", style.heading))]} />
        </h2>

        <FadeIn delay={0.1}>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            {pick(field("body", style.body))}
          </p>
        </FadeIn>
      </div>

      {/* Cinematic frame — aligned with the section, not edge-to-edge. */}
      {(bandVideo || bandImage) && (
        <div className="mx-auto mt-14 max-w-[1400px] px-6 sm:px-10">
          <FadeIn direction="none">
            <div className="relative overflow-hidden rounded-2xl border border-border">
              {bandVideo ? (
                <LazyVideo
                  src={bandVideo}
                  poster={bg.poster ?? undefined}
                  mode="ambient"
                  fit="contain"
                  label="Echo showreel"
                  className="aspect-video w-full"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bandImage} alt="" className="aspect-video w-full object-cover" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          </FadeIn>
        </div>
      )}

      {/* The six — clean oversized type, no boxes. */}
      <div className="mx-auto mt-20 max-w-[1400px] px-6 sm:px-10">
        <StaggerContainer
          className="flex flex-wrap items-baseline gap-x-10 gap-y-6"
          staggerDelay={0.06}
        >
          {steps.map((step, i) => (
            <StaggerItem key={i}>
              <span className="inline-flex items-baseline gap-3">
                <span className="font-mono text-sm text-[hsl(var(--echo-accent))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-3xl font-bold leading-none text-bright sm:text-5xl">
                  {step}
                </span>
              </span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
