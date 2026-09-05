"use client";

import dynamic from "next/dynamic";
import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { hero } from "@/lib/brand";
import { LineReveal, motion } from "@/components/motion";
import { ArrowRight, ArrowDown } from "lucide-react";

// Lightweight 2D canvas resonance animation: zero Three.js bundle overhead,
// 60-120fps smooth physics, no deprecation warnings, battery efficient.
const EchoResonance = dynamic(() => import("@/components/hero/echo-resonance"), {
  ssr: false,
});

export function HeroSection() {
  const { pick, isAr } = useI18n();
  const headline = pick(hero.headline);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden grain">
      {/* 3D Kinetic Echo Wavefield running on high-performance Canvas */}
      <EchoResonance className="absolute inset-0 z-0" />

      {/* Soft atmospheric gradient that keeps text crystal clear while letting Three.js waves shine */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--echo-base)/0.45)_90%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 pt-28 pb-20 sm:px-10">
        <motion.p
          className="eyebrow mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.15 }}
        >
          {pick(hero.eyebrow)}
        </motion.p>

        <h1 className="display-xl text-bright">
          <LineReveal lines={headline} delay={0.25} />
        </h1>

        <motion.div
          className="mt-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {pick(hero.body)}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[hsl(var(--echo-accent))] px-7 py-3.5 text-sm font-semibold text-[hsl(var(--echo-base))] transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
            >
              {pick(hero.ctaPrimary)}
              <ArrowRight
                size={17}
                className={`transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`}
              />
            </Link>

            <Link
              href="/art-house-studio"
              className="inline-flex items-center gap-2.5 rounded-full border border-border px-7 py-3.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-[hsl(var(--echo-accent))] hover:text-bright cursor-pointer"
            >
              {pick(hero.ctaSecondary)}
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-10 start-6 flex items-center gap-3 sm:start-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={15} className="text-muted-foreground" />
          </motion.span>
          <span className="eyebrow">{isAr ? "مرّر" : "Scroll"}</span>
        </motion.div>
      </div>
    </section>
  );
}
