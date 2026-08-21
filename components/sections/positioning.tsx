"use client";

import { useI18n } from "@/lib/i18n";
import { positioning } from "@/lib/brand";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export function PositioningSection() {
  const { pick } = useI18n();

  return (
    <section className="relative overflow-hidden border-t border-border bg-surface py-32 sm:py-48 grain">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">
            {pick(positioning.label)}
          </span>
          <span className="rule" />
        </div>

        {/* The statement every person at Echo should know by heart. */}
        <FadeIn>
          <p className="display-md max-w-5xl text-muted-foreground line-through decoration-[hsl(var(--echo-accent))] decoration-2">
            {pick(positioning.negation)}
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="display-md mt-10 max-w-5xl text-bright">
            {pick(positioning.affirmation)}
          </p>
        </FadeIn>
      </div>

      {/* "We think before we shoot" — the real differentiator. */}
      <div className="mx-auto mt-28 max-w-[1400px] px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-12 border-t border-border pt-20 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <h3 className="display-md text-bright">
                {pick(positioning.differentiator.title)}
              </h3>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <FadeIn delay={0.1}>
              <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {pick(positioning.differentiator.body)}
              </p>
            </FadeIn>

            <StaggerContainer className="mt-12 space-y-0" staggerDelay={0.08}>
              {pick(positioning.differentiator.steps).map((step, i, arr) => (
                <StaggerItem key={i}>
                  <div className="flex items-baseline gap-6 border-b border-border py-5 last:border-b-0">
                    <span className="font-mono text-xs text-[hsl(var(--echo-accent))]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        i === arr.length - 1
                          ? "text-lg font-semibold text-bright"
                          : "text-lg text-foreground"
                      }
                    >
                      {step}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
