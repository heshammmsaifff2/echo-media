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
import { MediaPanel } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";
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

  const offerItems = useItems(offerS.field("items", null), isAr, artHouse.offer.items);
  const equipItems = useItems(equipS.field("items", null), isAr, artHouse.equipment.items);

  return (
    <>
      {/* Hero — the space, full-bleed media. */}
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

      {/* The pitch — one large statement over media. */}
      <MediaPanel bg={introS.bg} label="The space" overlay="strong" align="center" minH="large">
        <FadeIn>
          <p className="display-md max-w-5xl text-bright drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)]">
            {pick(introS.field("body", artHouse.body))}
          </p>
        </FadeIn>
      </MediaPanel>

      {/* What the studio offers — clean editorial rows, no background. */}
      <section className="border-t border-border bg-background py-28 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mb-14 flex items-center gap-6">
            <span className="eyebrow whitespace-nowrap">
              {pick(offerS.field("heading", artHouse.offer.heading))}
            </span>
            <span className="rule" />
          </div>

          <StaggerContainer className="flex flex-col gap-10 sm:gap-14" staggerDelay={0.07}>
            {offerItems.map((item, i) => (
              <StaggerItem key={i}>
                <div className={`flex flex-col gap-2 sm:max-w-3xl ${i % 2 === 1 ? "sm:ms-auto sm:text-end" : ""}`}>
                  <span className="font-mono text-sm text-[hsl(var(--echo-accent))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-3xl font-bold leading-none text-bright sm:text-5xl">
                    {item.name}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Equipment — clean two-column definition list. */}
      <section className="border-t border-border bg-surface py-28 sm:py-36 grain">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mb-8 flex items-center gap-6">
            <span className="eyebrow whitespace-nowrap">
              {pick(equipS.field("heading", artHouse.equipment.heading))}
            </span>
            <span className="rule" />
          </div>

          <h2 className="display-md mb-12 max-w-3xl text-bright">
            <LineRevealInView lines={[pick(equipS.field("body", artHouse.equipment.body))]} />
          </h2>

          <div className="border-t border-border">
            {equipItems.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="grid grid-cols-1 items-baseline gap-2 border-b border-border py-7 md:grid-cols-12 md:gap-8">
                  <h3 className="text-2xl font-semibold text-bright md:col-span-5">{item.name}</h3>
                  <p className="text-muted-foreground md:col-span-7">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
