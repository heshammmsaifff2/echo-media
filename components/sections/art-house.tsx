"use client";

import { useI18n } from "@/lib/i18n";
import { artHouse } from "@/lib/brand";
import { LazyVideo } from "@/components/lazy-video";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  LineReveal,
  LineRevealInView,
} from "@/components/motion";
import { CtaSection } from "@/components/sections/closing";

export function ArtHouseContent() {
  const { pick } = useI18n();

  return (
    <>
      <section className="relative flex min-h-[85svh] items-end overflow-hidden pt-32 grain">
        <LazyVideo
          src="/final.mp4"
          poster="/posters/final.jpg"
          mode="ambient"
          label="Art House Studio"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/40" />

        <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-24 sm:px-10">
          <p className="eyebrow mb-8">{pick(artHouse.eyebrow)}</p>
          <h1 className="display-lg text-bright">
            <LineReveal lines={[pick(artHouse.title)]} delay={0.15} />
          </h1>
          <p className="mt-8 max-w-2xl text-xl text-foreground sm:text-2xl">
            {pick(artHouse.subtitle)}
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-background py-28 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <FadeIn>
            <p className="max-w-4xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              {pick(artHouse.body)}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-28 sm:py-40 grain">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mb-16 flex items-center gap-6">
            <span className="eyebrow whitespace-nowrap">
              {pick(artHouse.offer.heading)}
            </span>
            <span className="rule" />
          </div>

          <StaggerContainer className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {artHouse.offer.items.map((item, i) => (
              <StaggerItem key={i} className="group bg-surface">
                <div className="h-full p-10 transition-colors duration-500 group-hover:bg-background">
                  <span className="font-mono text-xs text-[hsl(var(--echo-accent))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold text-bright">
                    {pick(item.name)}
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

      <section className="border-t border-border bg-background py-28 sm:py-40">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mb-16 flex items-center gap-6">
            <span className="eyebrow whitespace-nowrap">
              {pick(artHouse.equipment.heading)}
            </span>
            <span className="rule" />
          </div>

          <h2 className="display-md mb-20 max-w-3xl text-bright">
            <LineRevealInView lines={[pick(artHouse.equipment.body)]} />
          </h2>

          <div className="border-t border-border">
            {artHouse.equipment.items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="group grid grid-cols-1 gap-4 border-b border-border py-8 transition-colors duration-500 hover:bg-surface md:grid-cols-12 md:items-baseline md:gap-8 md:px-4">
                  <span className="font-mono text-xs text-[hsl(var(--echo-accent))] md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold text-bright md:col-span-5">
                    {pick(item.name)}
                  </h3>
                  <p className="text-muted-foreground md:col-span-6">
                    {pick(item.body)}
                  </p>
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
