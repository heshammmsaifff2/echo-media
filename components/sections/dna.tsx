"use client";

import { useI18n } from "@/lib/i18n";
import { dna, values, type Bi } from "@/lib/brand";
import { FadeIn, StaggerContainer, StaggerItem, LineRevealInView } from "@/components/motion";

type DnaBlock = { title: Bi; body: Bi; note?: Bi };

export function DnaSection() {
  const { pick } = useI18n();

  // Annotated so the three blocks read as one shape rather than a union.
  const blocks: DnaBlock[] = [dna.whyWeExist, dna.vision, dna.mission];

  return (
    <section className="relative border-t border-border bg-background py-32 sm:py-44">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-20 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(dna.label)}</span>
          <span className="rule" />
        </div>

        <div className="divide-y divide-border">
          {blocks.map((block, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <article className="grid grid-cols-1 gap-8 py-14 md:grid-cols-12 md:gap-12">
                <div className="md:col-span-4">
                  <span className="mb-4 block font-mono text-sm text-[hsl(var(--echo-accent))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-md text-bright">{pick(block.title)}</h3>
                </div>

                <div className="md:col-span-8">
                  <p className="text-xl leading-relaxed text-foreground sm:text-2xl">
                    {pick(block.body)}
                  </p>
                  {block.note && (
                    <p className="mt-6 text-lg text-[hsl(var(--echo-accent))]">
                      {pick(block.note)}
                    </p>
                  )}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ValuesSection() {
  const { pick } = useI18n();

  return (
    <section className="relative border-t border-border bg-background py-32 sm:py-44">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(values.label)}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg mb-20 max-w-3xl text-bright">
          <LineRevealInView lines={[pick(values.heading)]} />
        </h2>

        <StaggerContainer
          className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.07}
        >
          {values.items.map((item, i) => (
            <StaggerItem key={i} className="group bg-background">
              <div className="h-full p-10 transition-colors duration-500 group-hover:bg-surface">
                <span className="font-mono text-sm text-[hsl(var(--echo-accent))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-2xl font-semibold text-bright">
                  {pick(item.title)}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {pick(item.body)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
