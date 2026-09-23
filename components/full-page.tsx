"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import {
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  motion,
  type MotionValue,
} from "framer-motion";

/**
 * Full-page slideshow driven by native scroll.
 *
 * Every child is one full-viewport panel. All panels are stacked in a single
 * pinned viewport (absolute, on top of each other) so you only ever see ONE at
 * a time — never part of one and part of the next. As you scroll through a
 * panel's slice of the page the panel scales up (its big type grows); at the
 * slice boundary it cross-fades completely to the next panel. Scrolling up runs
 * the exact same thing in reverse.
 *
 * Only the active panel and its neighbours are mounted, so a page of video
 * panels never decodes them all at once. Reduced-motion falls back to a plain
 * stack of full-height sections.
 */
export function FullPage({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const panels = Children.toArray(children);

  // The pinned slideshow needs each panel to fit one viewport, which only holds
  // on a roomy landscape screen. On phones/short screens (and for reduced
  // motion) we render plain stacked full-height sections that always scroll.
  // Server + first client render return the stack, so there is no hydration
  // mismatch; the desktop upgrade happens on mount, hidden behind the splash.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    // Enabled on phones (portrait) and up; only very short / landscape-phone
    // viewports fall back to plain scrolling, where the panels would not fit.
    const mq = window.matchMedia("(min-height: 560px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (reduced || !enabled || panels.length === 0) {
    return <>{children}</>;
  }
  return <FullPageInner panels={panels} />;
}

function FullPageInner({ panels }: { panels: ReactNode[] }) {
  const n = panels.length;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    setActive((cur) => (cur === idx ? cur : idx));
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${n * 100}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {panels.map((panel, i) => (
          <FullPanel key={i} i={i} n={n} progress={scrollYProgress} active={active}>
            {panel}
          </FullPanel>
        ))}
      </div>
    </div>
  );
}

function FullPanel({
  i,
  n,
  progress,
  active,
  children,
}: {
  i: number;
  n: number;
  progress: MotionValue<number>;
  active: number;
  children: ReactNode;
}) {
  const seg = 1 / n;
  const start = i * seg;
  const end = (i + 1) * seg;
  const h = seg * 0.13; // cross-fade half-width — short, so the swap feels clean

  // Opacity: stay at 1 across the panel's own slice, cross-fade at the borders.
  // The first and last panels hold full opacity at the page's very top / bottom.
  const opStops =
    i === 0
      ? [start, end - h, end + h]
      : i === n - 1
        ? [start - h, start + h, end]
        : [start - h, start + h, end - h, end + h];
  const opVals =
    i === 0 ? [1, 1, 0] : i === n - 1 ? [0, 1, 1] : [0, 1, 1, 0];

  const opacity = useTransform(progress, opStops, opVals);
  // Grow while inside the panel; resets for the next one.
  const scale = useTransform(progress, [start, end], [1, 1.22]);

  const mounted = Math.abs(i - active) <= 1;
  const isActive = active === i;

  return (
    <motion.div
      style={{ opacity, scale, pointerEvents: isActive ? "auto" : "none" }}
      className="absolute inset-0 h-full w-full will-change-[opacity,transform]"
      aria-hidden={!isActive}
    >
      {mounted ? children : null}
    </motion.div>
  );
}
