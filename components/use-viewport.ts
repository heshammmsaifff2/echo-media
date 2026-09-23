"use client";

import { useEffect, useState } from "react";

/**
 * True on roomy (desktop/tablet) viewports, false on phones. Used to decide how
 * background media fits: on desktop we show the whole frame (contain) with a
 * blurred fill; on a phone that would leave big ugly bars, so we fill instead.
 *
 * Defaults to true so the server render and first paint assume desktop; the
 * phone value settles on mount (behind the splash screen).
 */
export function useWideViewport(min = 768): boolean {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [min]);
  return wide;
}
