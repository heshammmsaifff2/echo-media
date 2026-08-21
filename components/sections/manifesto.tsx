"use client";

import { useRef } from "react";
import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { manifesto } from "@/lib/brand";
import { motion } from "@/components/motion";

/**
 * One manifesto line. Each tracks its own position in the viewport and brightens
 * as it crosses the middle, so reading down the list feels like a slow reveal
 * rather than a wall of text arriving at once.
 */
function Line({ text, index }: { text: string; index: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -16 : 16, 0]);

  return (
    <motion.p
      ref={ref}
      style={reduced ? undefined : { opacity, x }}
      className="display-md text-bright"
    >
      {text}
    </motion.p>
  );
}

export function ManifestoSection() {
  const { pick } = useI18n();
  const lines = pick(manifesto.lines);

  return (
    <section className="relative bg-background py-32 sm:py-48">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">
            {pick(manifesto.label)}
          </span>
          <span className="rule" />
        </div>

        <div className="max-w-5xl space-y-6 sm:space-y-8">
          {lines.map((line, i) => (
            <Line key={i} text={line} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
