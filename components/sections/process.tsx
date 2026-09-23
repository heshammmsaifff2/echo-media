"use client";

import { useI18n } from "@/lib/i18n";
import { clients } from "@/lib/brand";
import { FadeIn, LineRevealInView } from "@/components/motion";
import { MediaPanel, PanelTag } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";

export function ClientsSection() {
  const { pick } = useI18n();
  const { bg, field } = useSection("home.clients");
  const sectors = pick(field("sectors", clients.sectors));
  // Duplicated so the marquee can loop seamlessly at -50%.
  const track = [...sectors, ...sectors];

  return (
    <MediaPanel
      bg={bg}
      label="Who We Work With"
      overlay="strong"
      align="center"
      minH="large"
      contentClassName="!px-0"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10">
        <PanelTag>{pick(field("label", clients.label))}</PanelTag>

        <h2 className="display-lg max-w-4xl text-bright drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
          <LineRevealInView lines={[pick(field("heading", clients.heading))]} />
        </h2>

        <FadeIn delay={0.1}>
          <p className="mt-8 max-w-xl text-lg text-foreground/85">
            {pick(field("body", clients.body))}
          </p>
        </FadeIn>
      </div>

      <div className="marquee-mask mt-16 overflow-hidden" aria-hidden="true">
        <div className="marquee-track flex w-max items-center gap-6 pe-6">
          {track.map((sector, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="whitespace-nowrap text-3xl font-semibold text-bright/85 sm:text-5xl">
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
    </MediaPanel>
  );
}
