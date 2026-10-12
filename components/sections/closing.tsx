"use client";

import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { goal, cta } from "@/lib/brand";
import { FadeIn, LineRevealInView } from "@/components/motion";
import { useSection } from "@/components/content-provider";
import { ArrowRight } from "lucide-react";

export { DnaSection as GoalSection } from "@/components/sections/dna";

export function CtaSection() {
  const { pick, isAr } = useI18n();
  const { field } = useSection("global.cta");
  const tag = field("tag", { en: "Let's talk", ar: "لنبدأ" });

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-transparent py-32 sm:py-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[760px] max-w-[110vw] -translate-x-1/2 rounded-full bg-[hsl(var(--echo-accent))] opacity-[0.12] blur-[150px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
        <span className="eyebrow mb-6 block text-[hsl(var(--echo-accent))]">{pick(tag)}</span>

        <h2 className="display-lg max-w-4xl text-bright">
          <LineRevealInView lines={[pick(field("heading", cta.heading))]} />
        </h2>

        <FadeIn delay={0.12}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {pick(field("body", cta.body))}
          </p>

          <Link
            href={cta.href}
            className="group mt-12 inline-flex items-center gap-3 rounded-full bg-[hsl(var(--echo-accent))] px-9 py-4 text-base font-semibold text-[hsl(var(--echo-base))] transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
          >
            {pick(field("button", cta.button))}
            <ArrowRight
              size={19}
              className={`transition-transform duration-300 ${
                isAr ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
              }`}
            />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
