"use client";

import { useI18n } from "@/lib/i18n";
import { workflow, clients } from "@/lib/brand";
import { StaggerContainer, StaggerItem, FadeIn, LineRevealInView } from "@/components/motion";

export function ProcessSection() {
  const { pick } = useI18n();
  const steps = pick(workflow.steps);

  return (
    <section className="relative border-t border-border bg-surface py-32 sm:py-44 grain">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(workflow.label)}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg mb-20 max-w-3xl text-bright">
          <LineRevealInView lines={[pick(workflow.heading)]} />
        </h2>

        <StaggerContainer
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-4"
          staggerDelay={0.04}
        >
          {steps.map((step, i) => (
            <StaggerItem key={i} className="group bg-surface">
              <div className="relative flex h-full flex-col justify-between gap-10 p-7 transition-colors duration-500 group-hover:bg-background sm:p-9">
                <span className="font-mono text-xs text-muted-foreground transition-colors duration-500 group-hover:text-[hsl(var(--echo-accent))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-semibold leading-tight text-bright">
                  {step}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function ClientsSection() {
  const { pick } = useI18n();
  const sectors = pick(clients.sectors);
  // Duplicated so the marquee can loop seamlessly at -50%.
  const track = [...sectors, ...sectors];

  return (
    <section className="relative overflow-hidden border-t border-border bg-background py-32 sm:py-44">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(clients.label)}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg max-w-4xl text-bright">
          <LineRevealInView lines={[pick(clients.heading)]} />
        </h2>

        <FadeIn delay={0.1}>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            {pick(clients.body)}
          </p>
        </FadeIn>
      </div>

      <div className="marquee-mask mt-20 overflow-hidden" aria-hidden="true">
        <div className="marquee-track flex w-max items-center gap-6 pe-6">
          {track.map((sector, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="whitespace-nowrap text-3xl font-semibold text-muted-foreground sm:text-5xl">
                {sector}
              </span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--echo-accent))]" />
            </span>
          ))}
        </div>
      </div>

      {/* The marquee is decorative; this keeps the list available to everyone. */}
      <ul className="sr-only">
        {sectors.map((sector, i) => (
          <li key={i}>{sector}</li>
        ))}
      </ul>
    </section>
  );
}
