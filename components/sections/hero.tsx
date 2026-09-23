"use client";

import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { hero } from "@/lib/brand";
import { LineReveal, motion } from "@/components/motion";
import { MediaPanel } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";
import { ArrowRight, ArrowDown } from "lucide-react";

/**
 * Opening panel: the showreel running full-bleed with the headline laid over it.
 */
export function HeroSection() {
  const { pick, isAr } = useI18n();
  const { bg, field } = useSection("home.hero");
  const headline = pick(field("headline", hero.headline));

  return (
    <MediaPanel
      bg={bg}
      label="Echo Media Production showreel"
      overlay="default"
      align="center"
      minH="screen"
      contentClassName="pt-32"
    >
      <motion.p
        className="eyebrow mb-8 text-bright/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.15 }}
      >
        {pick(field("eyebrow", hero.eyebrow))}
      </motion.p>

      <h1 className="display-xl text-bright drop-shadow-[0_2px_40px_rgba(0,0,0,0.55)]">
        <LineReveal lines={headline} delay={0.25} />
      </h1>

      <motion.div
        className="mt-10 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-lg leading-relaxed text-foreground sm:text-2xl">
          {pick(field("body", hero.body))}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/portfolio"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[hsl(var(--echo-accent))] px-7 py-3.5 text-sm font-semibold text-[hsl(var(--echo-base))] transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
          >
            {pick(field("ctaPrimary", hero.ctaPrimary))}
            <ArrowRight
              size={17}
              className={`transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`}
            />
          </Link>

          <Link
            href="/art-house-studio"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-medium text-bright backdrop-blur-sm transition-colors duration-300 hover:border-[hsl(var(--echo-accent))] cursor-pointer"
          >
            {pick(field("ctaSecondary", hero.ctaSecondary))}
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
          <ArrowDown size={15} className="text-bright/70" />
        </motion.span>
        <span className="eyebrow text-bright/70">{isAr ? "مرّر" : "Scroll"}</span>
      </motion.div>
    </MediaPanel>
  );
}
