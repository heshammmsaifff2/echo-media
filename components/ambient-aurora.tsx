"use client";

import { useReducedMotion } from "framer-motion";
import { useActiveScene } from "@/components/home-scenes";

/**
 * One staging per home section: where the light sits and what tint it carries.
 * Switching scenes glides between these, so moving to the next section reads
 * as a change of set rather than one static backdrop.
 */
const SCENES = [
  { x: 0, y: 0, rotate: 0, scale: 1, tint: "rgba(34,114,247,0.00)" },
  { x: 18, y: -22, rotate: 8, scale: 1.12, tint: "rgba(34,114,247,0.18)" },
  { x: -16, y: -10, rotate: -10, scale: 1.05, tint: "rgba(120,90,255,0.16)" },
  { x: 10, y: 14, rotate: 14, scale: 1.18, tint: "rgba(20,160,255,0.14)" },
  { x: -20, y: -26, rotate: -6, scale: 1.1, tint: "rgba(74,124,245,0.20)" },
  { x: 22, y: 8, rotate: -14, scale: 1.08, tint: "rgba(100,70,240,0.18)" },
  { x: -8, y: -18, rotate: 10, scale: 1.15, tint: "rgba(30,140,255,0.15)" },
  { x: 14, y: -6, rotate: -8, scale: 1.04, tint: "rgba(90,110,255,0.17)" },
  { x: 0, y: -30, rotate: 0, scale: 1.2, tint: "rgba(34,114,247,0.24)" },
];

/**
 * AmbientAurora — dark-dominant cinematic aura
 *
 * Color hierarchy (by area, darkest -> brightest):
 *  - #01040F / #020821  : top ~35% (dominant, near-black navy)
 *  - #07147A / #0D1F85  : mid band (deep cobalt)
 *  - #2272F7            : bottom-left bloom only (the "signature glow")
 *  - #4A7CF5            : soft diagonal light streak on the right edge
 */
export function AmbientAurora() {
  const reduced = useReducedMotion();
  const anim = (cls: string) => (reduced ? "" : cls);
  const active = useActiveScene();
  const scene = SCENES[active % SCENES.length];
  const glide = reduced ? "none" : "transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#01040F]"
      style={{
        transform: "translate3d(0, 0, 0)",
        contain: "strict",
        backfaceVisibility: "hidden",
      }}
    >
      {/* 1. Base: long dark runway, brightness only arrives at the very bottom */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #01040F 0%, #020821 28%, #060F5E 52%, #0B2AA8 74%, #1B58E0 92%, #2A6BF0 100%)",
        }}
      />

      {/* Stage: the light rig moves as a whole between section scenes. */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${scene.x}vw, ${scene.y}vh, 0) rotate(${scene.rotate}deg) scale(${scene.scale})`,
          transition: glide,
        }}
      >
      {/* 2. Deep cobalt body — mid-left, gives the rich blue middle */}
      <div
        className={`absolute top-[28%] -left-[10%] h-[800px] w-[800px] rounded-full opacity-70 ${anim(
          "aurora-orb-1"
        )}`}
        style={{
          background:
            "radial-gradient(circle closest-side, #0D1F85 0%, rgba(13, 31, 133, 0.85) 30%, rgba(13, 31, 133, 0.35) 65%, rgba(13, 31, 133, 0.08) 85%, transparent 100%)",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* 3. Royal mid-right — kept moderate so it doesn't wash out the dark */}
      <div
        className={`absolute top-[38%] -right-[15%] h-[650px] w-[650px] rounded-full opacity-50 ${anim(
          "aurora-orb-2"
        )}`}
        style={{
          background:
            "radial-gradient(circle closest-side, #1B3BB8 0%, rgba(27, 59, 184, 0.8) 30%, rgba(27, 59, 184, 0.3) 65%, rgba(27, 59, 184, 0.06) 85%, transparent 100%)",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* 4. Signature bloom: bright electric blue, bottom-left ONLY */}
      <div
        className={`absolute -bottom-[22%] -left-[18%] h-[760px] w-[760px] rounded-full opacity-75 ${anim(
          "aurora-orb-3"
        )}`}
        style={{
          background:
            "radial-gradient(circle closest-side, #2272F7 0%, rgba(34, 114, 247, 0.85) 35%, rgba(34, 114, 247, 0.35) 65%, rgba(34, 114, 247, 0.08) 85%, transparent 100%)",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* 5. Bottom-right: smaller, dimmer royal glow */}
      <div
        className={`absolute -bottom-[18%] right-[0%] h-[560px] w-[560px] rounded-full opacity-40 ${anim(
          "aurora-orb-4"
        )}`}
        style={{
          background:
            "radial-gradient(circle closest-side, #3A6FE0 0%, rgba(58, 111, 224, 0.8) 30%, rgba(58, 111, 224, 0.3) 65%, rgba(58, 111, 224, 0.06) 85%, transparent 100%)",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* 6. Diagonal light streak (the soft beam on the right side of the poster) */}
      <div
        className={`absolute top-[58%] -right-[25%] h-[240px] w-[1200px] -rotate-[32deg] rounded-full opacity-50 ${anim(
          "aurora-streak"
        )}`}
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 60% 50%, rgba(120, 160, 255, 0.6) 0%, rgba(74, 124, 245, 0.85) 30%, rgba(74, 124, 245, 0.3) 60%, rgba(74, 124, 245, 0.06) 85%, transparent 100%)",
          transform: "translate3d(0, 0, 0) rotate(-32deg)",
          backfaceVisibility: "hidden",
        }}
      />

      </div>

      {/* Scene tints cross-fade so each section carries its own colour temperature. */}
      {SCENES.map((sc, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at ${50 + sc.x}% ${55 - sc.y}%, ${sc.tint}, transparent 70%)`,
            opacity: i === active % SCENES.length ? 1 : 0,
            transition: reduced ? "none" : "opacity 1.2s ease",
          }}
        />
      ))}

      {/* Light sweep that plays once on every scene change. */}
      {!reduced && active > 0 && <div key={active} className="scene-sweep absolute inset-0" />}

      {/* 7. Top vignette — locks the upper third to near-black so dark stays dominant */}
      <div
        className="absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "linear-gradient(180deg, #01040F 0%, rgba(1,4,15,0.92) 35%, rgba(2,8,33,0.5) 70%, transparent 100%)",
        }}
      />

      {/* 8. Soft contrast layer: slightly darkens edges/right-top, keeps the glow focused bottom-left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 25% 100%, transparent 0%, transparent 45%, rgba(1,4,15,0.45) 100%)",
        }}
      />

      {/* 9. Grain to kill banding — standard alpha blend instead of costly framebuffer readback */}
      <div className="grain absolute inset-0 opacity-25" />
    </div>
  );
}