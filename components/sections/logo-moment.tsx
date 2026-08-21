"use client";

import { useRef } from "react";
import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { LogoBlock } from "@/components/logo";
import { motion } from "@/components/motion";

/**
 * The logo moment — the lockup at full scale, framed like a title card.
 * Scroll drives a slow scale and lift so it settles as it enters the viewport.
 */
export function LogoMoment() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.86, 1, 1.06]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0.55, 0.15]);

  const { isAr } = useI18n();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-border bg-background py-32 sm:py-44 grain"
    >
      {/* Accent bloom behind the mark. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: reduced ? 0.3 : glow }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] max-w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--echo-accent))] blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
        <motion.div
          style={reduced ? undefined : { scale, y }}
          className="mx-auto w-full max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, filter: "blur(14px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoBlock variant="white" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-col items-center gap-6"
        >
          <span className="h-px w-16 bg-[hsl(var(--echo-accent))]" />
          <p
            className="text-center text-2xl font-light tracking-[0.18em] text-bright sm:text-3xl"
            dir="ltr"
          >
            {brand.motto}
          </p>
          <p className="eyebrow text-center">
            {isAr ? "الفلسفة الداخلية" : "Internal philosophy"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
