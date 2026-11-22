"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Home-page "scenes": each section reports when it reaches the middle of the
 * viewport, and the fixed AmbientAurora re-stages itself for that scene.
 * Sections themselves are never transformed (several rely on position: sticky).
 */
const SceneContext = createContext<{ active: number; setActive: (i: number) => void } | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  return <SceneContext.Provider value={{ active, setActive }}>{children}</SceneContext.Provider>;
}

/** Index of the section currently in view; 0 outside a SceneProvider. */
export function useActiveScene() {
  return useContext(SceneContext)?.active ?? 0;
}

export function Scene({ index, children }: { index: number; children: ReactNode }) {
  const ctx = useContext(SceneContext);
  const ref = useRef<HTMLDivElement>(null);
  const setActive = ctx?.setActive;

  useEffect(() => {
    const el = ref.current;
    if (!el || !setActive) return;
    // A thin band across the viewport's middle: whichever section crosses it is active.
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(index); },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, setActive]);

  return <div ref={ref} className="relative w-full">{children}</div>;
}
