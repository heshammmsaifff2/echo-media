"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LazyVideo } from "@/components/lazy-video";
import { useWideViewport } from "@/components/use-viewport";
import type { SectionBg } from "@/lib/content";

type Align = "center" | "bottom" | "top";
type Overlay = "default" | "strong" | "soft";
type MinH = "screen" | "large" | "half" | "auto";

const MIN_H: Record<MinH, string> = {
  screen: "min-h-[100svh]",
  large: "min-h-[88svh]",
  half: "min-h-[60svh]",
  auto: "",
};

const ALIGN: Record<Align, string> = {
  center: "justify-center",
  bottom: "justify-end",
  top: "justify-start",
};

/**
 * The building block of the whole site: one full-bleed background (image or
 * ambient video) with a legibility scrim and large text laid over it.
 *
 * Pass either `image` (a path in /public) or `video` (played as a muted,
 * looping ambient background). Everything else is a knob for scrim strength,
 * vertical alignment, and height.
 */
export function MediaPanel({
  image,
  video,
  poster,
  bg,
  label,
  overlay = "default",
  align = "center",
  minH = "screen",
  grain = true,
  priority = false,
  className,
  contentClassName,
  children,
}: {
  image?: string;
  video?: string;
  poster?: string;
  /** DB-driven background; when set (type !== "none") it overrides image/video/poster. */
  bg?: SectionBg;
  label?: string;
  overlay?: Overlay;
  align?: Align;
  minH?: MinH;
  grain?: boolean;
  priority?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  // A stored background wins over the code default.
  if (bg && bg.type !== "none") {
    if (bg.type === "video") {
      video = bg.url ?? undefined;
      poster = bg.poster ?? poster;
      image = undefined;
    } else if (bg.type === "image") {
      image = bg.url ?? undefined;
      video = undefined;
    }
  } else if (bg && bg.type === "none") {
    image = undefined;
    video = undefined;
  }

  // Phones fill the frame (cover); wider screens show the whole image with a
  // blurred fill behind it.
  const wide = useWideViewport();

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        MIN_H[minH],
        grain && "grain",
        className
      )}
    >
      {/* Background layer. Media is shown in full (contain) so a 16:9 or 9:16
          upload is never cropped; a blurred blow-up of the same media fills the
          rest of the frame. */}
      {video ? (
        <LazyVideo
          src={video}
          poster={poster}
          mode="ambient"
          fit="contain"
          label={label}
          className="absolute inset-0 h-full w-full"
        />
      ) : image ? (
        wide ? (
          <>
            <Image
              src={image}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              className="absolute inset-0 scale-110 object-cover opacity-60 blur-2xl"
            />
            <Image
              src={image}
              alt={label ?? ""}
              fill
              priority={priority}
              sizes="100vw"
              className="absolute inset-0 object-contain"
            />
          </>
        ) : (
          <Image
            src={image}
            alt={label ?? ""}
            fill
            priority={priority}
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
        )
      ) : null}

      {/* Legibility scrims — a flat tint plus a bottom-weighted gradient so text
          reads no matter what the frame is doing, and the section blends into
          the next one. A soft top wash keeps the fixed navbar readable. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-[1]",
          overlay === "strong"
            ? "bg-black/65"
            : overlay === "soft"
              ? "bg-black/25"
              : "bg-black/45"
        )}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/25 to-background/45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-background/70 to-transparent"
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-6 py-32 sm:px-10 sm:py-40",
          MIN_H[minH],
          ALIGN[align],
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** The small uppercase section tag used across every panel. */
export function PanelTag({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-5">
      <span className="eyebrow whitespace-nowrap text-bright/70">{children}</span>
      <span className="h-px w-16 bg-white/30" />
    </div>
  );
}
