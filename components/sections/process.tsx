"use client";

import { useI18n } from "@/lib/i18n";
import { clients } from "@/lib/brand";
import { FadeIn, LineRevealInView } from "@/components/motion";
import { useSection } from "@/components/content-provider";

export function ClientsSection() {
  const { pick } = useI18n();
  const { field } = useSection("home.clients");
  const sectors = pick(field("sectors", clients.sectors));
  // Duplicated so the marquee can loop seamlessly at -50%.
  const track = [...sectors, ...sectors];

  return (
    <section className="relative overflow-hidden border-t border-border bg-background py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-12 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(field("label", clients.label))}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg max-w-4xl text-bright">
          <LineRevealInView lines={[pick(field("heading", clients.heading))]} />
        </h2>

        <FadeIn delay={0.1}>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            {pick(field("body", clients.body))}
          </p>
        </FadeIn>
      </div>

      <div className="marquee-mask mt-16 overflow-hidden" aria-hidden="true">
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
