"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useActiveScene } from "@/components/home-scenes";

/** Section tints on the home page: each section carries its own colour temperature. */
const SCENE_TINTS = [
  "rgba(34,114,247,0.00)",
  "rgba(34,114,247,0.16)",
  "rgba(120,90,255,0.14)",
  "rgba(20,160,255,0.12)",
  "rgba(74,124,245,0.18)",
  "rgba(100,70,240,0.16)",
  "rgba(30,140,255,0.13)",
  "rgba(90,110,255,0.15)",
  "rgba(34,114,247,0.20)",
];

/**
 * One screen-tall panel of light. Panels are stacked down the full length of the
 * page and scroll with it, so the backdrop travels up as you scroll down (and
 * back down as you scroll up) instead of sitting pinned behind the content.
 * Four layouts alternate so consecutive screens never look the same.
 */
const PANELS = [
  [
    { top: "55%", left: "-18%", size: 760, color: "34,114,247", alpha: 0.75 },
    { top: "20%", left: "70%", size: 560, color: "27,59,184", alpha: 0.5 },
  ],
  [
    { top: "10%", left: "60%", size: 720, color: "13,31,133", alpha: 0.8 },
    { top: "60%", left: "-10%", size: 520, color: "58,111,224", alpha: 0.4 },
  ],
  [
    { top: "35%", left: "25%", size: 820, color: "27,59,184", alpha: 0.55 },
    { top: "-10%", left: "-15%", size: 480, color: "34,114,247", alpha: 0.45 },
  ],
  [
    { top: "45%", left: "65%", size: 780, color: "34,114,247", alpha: 0.65 },
    { top: "5%", left: "5%", size: 600, color: "13,31,133", alpha: 0.7 },
  ],
];

/**
 * AmbientAurora — dark-dominant cinematic aura that scrolls with the page.
 * Palette: near-black navy base (#01040F / #020821), deep cobalt bodies
 * (#0D1F85 / #1B3BB8) and the signature electric blue (#2272F7).
 */
export function AmbientAurora() {
  const reduced = useReducedMotion();
  const active = useActiveScene();
  const [panels, setPanels] = useState(1);

  // Enough panels to cover the whole page; recount whenever the page grows or shrinks.
  useEffect(() => {
    const count = () =>
      setPanels(Math.max(1, Math.ceil(document.body.scrollHeight / Math.max(1, window.innerHeight))));
    count();
    const ro = new ResizeObserver(count);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      {/* Page-long layer: absolutely positioned on <body>, so it scrolls with the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#01040F]"
        style={{
          // One seamless dark → cobalt → dark wave every two screens, under all the lights.
          backgroundImage: "repeating-linear-gradient(180deg, #01040F 0vh, #020821 45vh, #060F5E 100vh, #020821 155vh, #01040F 200vh)",
        }}
      >
        {Array.from({ length: panels }, (_, i) => (
          <div
            key={i}
            className="relative h-screen w-full"
          >
            {PANELS[i % PANELS.length].map((orb, j) => (
              <div
                key={j}
                className="absolute rounded-full"
                style={{
                  top: orb.top,
                  left: orb.left,
                  width: orb.size,
                  height: orb.size,
                  opacity: orb.alpha,
                  background: `radial-gradient(circle closest-side, rgb(${orb.color}) 0%, rgba(${orb.color},0.8) 30%, rgba(${orb.color},0.3) 65%, rgba(${orb.color},0.06) 85%, transparent 100%)`,
                }}
              />
            ))}
          </div>
        ))}
        <div className="grain absolute inset-0 opacity-25" />
      </div>

      {/* Viewport overlay: section tints cross-fade. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {SCENE_TINTS.map((tint, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 55%, ${tint}, transparent 70%)`,
              opacity: i === active % SCENE_TINTS.length ? 1 : 0,
              transition: reduced ? "none" : "opacity 1.2s ease",
            }}
          />
        ))}
      </div>
    </>
  );
}
