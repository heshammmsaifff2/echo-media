"use client";

import { useI18n } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { LogoBlock } from "@/components/logo";
import { motion } from "@/components/motion";
import { MediaPanel } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";

/**
 * The logo moment — the lockup at full scale, framed like a title card over the
 * showreel, with the motto beneath it.
 */
export function LogoMoment() {
  const { isAr } = useI18n();
  const { bg, field } = useSection("home.logo");
  const philosophy = field("philosophy", {
    en: "Internal philosophy",
    ar: "الفلسفة الداخلية",
  });

  return (
    <MediaPanel
      bg={bg}
      label="Echo Media Production"
      overlay="strong"
      align="center"
      minH="screen"
      contentClassName="items-center text-center"
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(14px)", scale: 0.9 }}
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
        <p className="eyebrow text-center text-bright/70">
          {isAr ? philosophy.ar : philosophy.en}
        </p>
      </motion.div>
    </MediaPanel>
  );
}
