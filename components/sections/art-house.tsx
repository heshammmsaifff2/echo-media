"use client";

import { useI18n } from "@/lib/i18n";
import { artHouse } from "@/lib/brand";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  LineReveal,
  LineRevealInView,
} from "@/components/motion";
import { MediaPanel, PanelTag } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";
import { FullPage } from "@/components/full-page";
import { CtaSection } from "@/components/sections/closing";

type Item = { name: string; body: string };

/** Localize a stored obj-list override, else fall back to the brand items. */
function useItems(
  override: { en: Record<string, string>[]; ar: Record<string, string>[] } | null,
  isAr: boolean,
  fallback: readonly { name: { en: string; ar: string }; body: { en: string; ar: string } }[]
): Item[] {
  if (override) {
    const arr = isAr ? override.ar : override.en;
    if (Array.isArray(arr) && arr.length) {
      return arr.map((r) => ({ name: r.name ?? "", body: r.body ?? "" }));
    }
  }
  return fallback.map((i) => ({
    name: isAr ? i.name.ar : i.name.en,
    body: isAr ? i.body.ar : i.body.en,
  }));
}

export function ArtHouseContent() {
  const { pick, isAr } = useI18n();

  const heroS = useSection("studio.hero");
  const introS = useSection("studio.intro");
  const offerS = useSection("studio.offer");
  const equipS = useSection("studio.equipment");

  const offerItems = useItems(
    offerS.field("items", null),
    isAr,
    artHouse.offer.items
  );
  const equipItems = useItems(
    equipS.field("items", null),
    isAr,
    artHouse.equipment.items
  );

  return (
    <FullPage>
      {/* Hero — the space, running full-bleed. */}
      <MediaPanel
        bg={heroS.bg}
        label="Art House Studio"
        overlay="default"
        align="bottom"
        minH="screen"
        contentClassName="pt-32"
        priority
      >
        <p className="eyebrow mb-8 text-bright/70">{pick(heroS.field("eyebrow", artHouse.eyebrow))}</p>
        <h1 className="display-xl text-bright drop-shadow-[0_2px_40px_rgba(0,0,0,0.55)]">
          <LineReveal lines={[pick(heroS.field("title", artHouse.title))]} delay={0.15} />
        </h1>
        <p className="mt-8 max-w-2xl text-xl text-foreground sm:text-2xl">
          {pick(heroS.field("subtitle", artHouse.subtitle))}
        </p>
      </MediaPanel>

      {/* The pitch, one large statement. */}
      <MediaPanel bg={introS.bg} label="The space" overlay="strong" align="center" minH="large">
        <FadeIn>
          <p className="display-md max-w-5xl text-bright drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)]">
            {pick(introS.field("body", artHouse.body))}
          </p>
        </FadeIn>
      </MediaPanel>

      {/* What the studio offers — big alternating editorial rows, not a grid. */}
      <MediaPanel
        bg={offerS.bg}
        label="What the studio offers"
        overlay="strong"
        align="center"
        minH="screen"
      >
        <PanelTag>{pick(offerS.field("heading", artHouse.offer.heading))}</PanelTag>

        <StaggerContainer className="flex flex-col gap-6 sm:gap-8" staggerDelay={0.07}>
          {offerItems.map((item, i) => (
            <StaggerItem key={i}>
              <div
                className={`flex flex-col gap-1.5 sm:max-w-3xl ${
                  i % 2 === 1 ? "sm:ms-auto sm:text-end" : ""
                }`}
              >
                <h3 className="text-2xl font-bold leading-none text-bright drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)] sm:text-4xl">
                  <span className="me-3 font-mono text-sm font-normal text-[hsl(var(--echo-accent))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.name}
                </h3>
                <p className="text-base leading-relaxed text-foreground/85">{item.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </MediaPanel>

      {/* Equipment — a large two-column definition list, no boxes. */}
      <MediaPanel
        bg={equipS.bg}
        label="Equipment"
        overlay="strong"
        align="center"
        minH="screen"
      >
        <PanelTag>{pick(equipS.field("heading", artHouse.equipment.heading))}</PanelTag>

        <h2 className="display-md mb-8 max-w-3xl text-bright drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)]">
          <LineRevealInView lines={[pick(equipS.field("body", artHouse.equipment.body))]} />
        </h2>

        <StaggerContainer className="flex flex-col" staggerDelay={0.04}>
          {equipItems.map((item, i) => (
            <StaggerItem key={i}>
              <div className="grid grid-cols-1 items-baseline gap-1 border-t border-white/15 py-4 md:grid-cols-12 md:gap-8">
                <h3 className="text-xl font-semibold text-bright md:col-span-5">
                  {item.name}
                </h3>
                <p className="text-base text-foreground/80 md:col-span-7">{item.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </MediaPanel>

      <CtaSection />
    </FullPage>
  );
}
