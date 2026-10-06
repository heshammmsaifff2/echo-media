"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { hero } from "@/lib/brand";
import { LineReveal, motion } from "@/components/motion";
import { useSection } from "@/components/content-provider";
import { ArrowRight, ArrowDown } from "lucide-react";

// GPU echo wavefield — client only, and it stops rendering once scrolled past.
const EchoField = dynamic(() => import("@/components/three/echo-field"), {
  ssr: false,
});

/**
 * Opening panel: a live Three.js wavefield rippling like an echo, with the
 * headline set over it. No media background here — the motion is the backdrop.
 */
export function HeroSection() {
  const { pick, isAr } = useI18n();
  const reduced = useReducedMotion();
  const { field } = useSection("home.hero");
  const headline = pick(field("headline", hero.headline));

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden hero-stage grain">
      <EchoField className="hero-wavefield absolute inset-0 z-0" />

      {/* Keep the moving field behind a dark reading area. */}
      <div className="hero-reading-shade pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 pt-32 pb-28 sm:px-10 sm:pt-36 sm:pb-32">
        <motion.p
          className="eyebrow mb-8 flex items-center gap-3 !text-white"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span aria-hidden="true" className="h-px w-9 bg-primary" />
          {pick(field("eyebrow", hero.eyebrow))}
        </motion.p>

        <h1 className="display-xl hero-headline max-w-[1100px] text-bright">
          <LineReveal lines={headline} delay={0.18} lineClassName={isAr ? "pb-[0.14em]" : undefined} />
        </h1>

        <motion.div
          className="mt-10 max-w-2xl"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="hero-description max-w-xl text-lg leading-relaxed sm:text-xl">
            {pick(field("body", hero.body))}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[hsl(var(--echo-accent))] px-7 py-3.5 text-sm font-semibold text-[hsl(var(--echo-base))] shadow-[0_8px_36px_hsl(var(--echo-accent)/0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_44px_hsl(var(--echo-accent)/0.4)] motion-reduce:transform-none cursor-pointer"
            >
              {pick(field("ctaPrimary", hero.ctaPrimary))}
              <ArrowRight
                size={17}
                className={`transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`}
              />
            </Link>

            <Link
              href="/art-house-studio"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/40 bg-background/45 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-300 hover:border-[hsl(var(--echo-accent))] hover:bg-primary/10 hover:text-bright cursor-pointer"
            >
              {pick(field("ctaSecondary", hero.ctaSecondary))}
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-10 start-6 flex items-center gap-3 sm:start-10"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          <motion.span
            animate={reduced ? { y: 0 } : { y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={15} className="text-white" />
          </motion.span>
          <span className="eyebrow !text-white">{isAr ? "مرّر" : "Scroll"}</span>
        </motion.div>
      </div>
    </section>
  );
}
