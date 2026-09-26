"use client";

import { useI18n } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { LogoBlock } from "@/components/logo";
import { motion } from "@/components/motion";
import { useSection } from "@/components/content-provider";

/**
 * The logo moment — the lockup at full scale over the dark base with an accent
 * bloom, framed like a title card. No media background: it is a clean beat.
 */
export function LogoMoment() {
  const { isAr } = useI18n();
  const { field } = useSection("home.logo");
  const philosophy = field("philosophy", {
    en: "Internal philosophy",
    ar: "الفلسفة الداخلية",
  });

  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-32 sm:py-44 grain">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] max-w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--echo-accent))] opacity-[0.16] blur-[150px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, filter: "blur(14px)", scale: 0.92 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-3xl"
        >
          <LogoBlock variant="white" />
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
          <p className="eyebrow text-center">{isAr ? philosophy.ar : philosophy.en}</p>
        </motion.div>
      </div>
    </section>
  );
}
