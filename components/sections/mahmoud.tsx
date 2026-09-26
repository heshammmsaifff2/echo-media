"use client";

import { useI18n } from "@/lib/i18n";
import { founder } from "@/lib/brand";
import {
  StaggerContainer,
  StaggerItem,
  LineReveal,
} from "@/components/motion";
import { MediaPanel } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";
import { CtaSection } from "@/components/sections/closing";

type Item = { title: string; body: string };

export function MahmoudContent() {
  const { pick, isAr } = useI18n();

  const heroS = useSection("founder.hero");
  const focusS = useSection("founder.focus");

  const override = focusS.field(
    "items",
    null as null | { en: Record<string, string>[]; ar: Record<string, string>[] }
  );
  const items: Item[] = (() => {
    if (override) {
      const arr = isAr ? override.ar : override.en;
      if (Array.isArray(arr) && arr.length) {
        return arr.map((r) => ({ title: r.title ?? "", body: r.body ?? "" }));
      }
    }
    return founder.focus.items.map((i) => ({
      title: isAr ? i.title.ar : i.title.en,
      body: isAr ? i.body.ar : i.body.en,
    }));
  })();

  return (
    <>
      {/* Founder hero — full-bleed media with the name and quote laid over it. */}
      <MediaPanel
        bg={heroS.bg}
        label={pick(heroS.field("name", founder.name))}
        overlay="strong"
        align="bottom"
        minH="screen"
        contentClassName="pt-32"
        priority
      >
        <p className="eyebrow mb-5 text-bright/70">{pick(heroS.field("role", founder.role))}</p>
        <h1 className="display-lg text-bright drop-shadow-[0_2px_40px_rgba(0,0,0,0.55)]">
          <LineReveal lines={[pick(heroS.field("name", founder.name))]} delay={0.15} />
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          {pick(heroS.field("bio", founder.bio))}
        </p>

        <blockquote className="mt-6 border-s-2 border-[hsl(var(--echo-accent))] ps-5">
          <p className="text-lg leading-relaxed text-bright sm:text-xl">
            {pick(heroS.field("quote", founder.quote))}
          </p>
        </blockquote>
      </MediaPanel>

      {/* Where he works — clean numbered stack on the dark base. */}
      <section className="border-t border-border bg-background py-28 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mb-14 flex items-center gap-6">
            <span className="eyebrow whitespace-nowrap">
              {pick(focusS.field("heading", founder.focus.heading))}
            </span>
            <span className="rule" />
          </div>

          <StaggerContainer className="flex flex-col" staggerDelay={0.06}>
            {items.map((item, i) => (
              <StaggerItem key={i}>
                <div className="flex flex-col gap-2 border-t border-border py-8 sm:flex-row sm:items-baseline sm:gap-10">
                  <span className="font-mono text-sm text-[hsl(var(--echo-accent))] sm:w-14 sm:shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="sm:flex-1">
                    <h3 className="text-2xl font-bold leading-tight text-bright sm:text-4xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
