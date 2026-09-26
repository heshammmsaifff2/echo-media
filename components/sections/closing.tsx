"use client";

import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { goal, cta } from "@/lib/brand";
import { FadeIn, LineRevealInView } from "@/components/motion";
import { useSection } from "@/components/content-provider";
import { ArrowRight } from "lucide-react";

/** The 2030 ambition — the question and the one-word answer, on the dark base. */
export function GoalSection() {
  const { pick } = useI18n();
  const { field } = useSection("home.goal");

  return (
    <section className="relative overflow-hidden border-t border-border bg-surface py-36 sm:py-52 grain">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[700px] max-w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--echo-accent))] opacity-20 blur-[150px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 text-center sm:px-10">
        <FadeIn>
          <span className="eyebrow">{pick(field("label", goal.label))}</span>
        </FadeIn>

        <p className="display-md mx-auto mt-10 max-w-3xl text-muted-foreground">
          {pick(field("question", goal.question))}
        </p>

        <div className="mt-10">
          <h2 className="display-xl text-bright" dir="ltr">
            <LineRevealInView lines={[pick(field("answer", goal.answer))]} />
          </h2>
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  const { pick, isAr } = useI18n();
  const { field } = useSection("global.cta");
  const tag = field("tag", { en: "Let's talk", ar: "لنبدأ" });

  return (
    <section className="relative overflow-hidden border-t border-border bg-background py-32 sm:py-44">
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
