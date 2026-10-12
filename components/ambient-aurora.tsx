"use client";

import { useReducedMotion } from "framer-motion";

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

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 -z-10 h-screen w-full -mb-[100vh] overflow-hidden bg-[#01040F]"
      style={{
        transform: "translate3d(0, 0, 0)",
        contain: "paint layout",
        willChange: "transform",
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