"use client";

import { useI18n } from "@/lib/i18n";
import { style } from "@/lib/brand";
import { LazyVideo } from "@/components/lazy-video";
import {
  FadeIn,
  Parallax,
  StaggerContainer,
  StaggerItem,
  LineRevealInView,
} from "@/components/motion";

/**
 * Ambient landscape loop behind the Echo style breakdown — the six things every
 * film that leaves this house has to carry.
 */
export function ShowreelSection() {
  const { pick } = useI18n();

  return (
    <section className="relative border-t border-border bg-background py-32 sm:py-44">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(style.label)}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg mb-8 max-w-4xl text-bright">
          <LineRevealInView lines={[pick(style.heading)]} />
        </h2>

        <FadeIn delay={0.1}>
          <p className="mb-16 max-w-xl text-lg text-muted-foreground">
            {pick(style.body)}
          </p>
        </FadeIn>
      </div>

      {/* Full-bleed loop. */}
      <FadeIn direction="none">
        <div className="relative">
          <LazyVideo
            src="/final.mp4"
            poster="/posters/final.jpg"
            mode="ambient"
            label="Echo showreel"
            className="aspect-[21/9] w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-70" />
        </div>
      </FadeIn>

      <div className="mx-auto mt-20 max-w-[1400px] px-6 sm:px-10">
        <StaggerContainer
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3 lg:grid-cols-6"
          staggerDelay={0.06}
        >
          {pick(style.steps).map((step, i) => (
            <StaggerItem key={i} className="bg-background">
              <div className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
                <span className="font-mono text-xs text-[hsl(var(--echo-accent))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-semibold leading-tight text-bright sm:text-lg">
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

/**
 * The long-form film, plus the two vertical pieces layered behind the copy so
 * the section reads in depth rather than as a flat row of boxes.
 */
export function FilmSection() {
  const { isAr } = useI18n();

  return (
    <section className="relative overflow-hidden border-t border-border bg-surface py-32 sm:py-44 grain">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">
            {isAr ? "من أعمالنا" : "Selected Work"}
          </span>
          <span className="rule" />
        </div>

        <FadeIn>
          <LazyVideo
            src="/final_2.mp4"
            poster="/posters/final2.jpg"
            mode="feature"
            label={isAr ? "فيلم Echo" : "Echo brand film"}
            className="aspect-video w-full rounded-2xl border border-border"
          />
        </FadeIn>

        <div className="mt-24 grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <h3 className="display-md text-bright">
                {isAr
                  ? "إضاءة مدروسة. تصنع الفارق."
                  : "Intentional lighting. Crafted for impact."}
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {isAr
                  ? "الإضاءة ليست مجرد وضوح للمشهد، بل هي ما يمنح الكادر عمقه السينمائي وهويته البصرية المميزة."
                  : "Lighting isn't just about visibility—it's what shapes cinematic depth, mood, and visual identity."}
              </p>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-5 sm:gap-8">
              <Parallax distance={34}>
                <LazyVideo
                  src="/vid1-16-9.mp4"
                  poster="/posters/vid1.jpg"
                  mode="ambient"
                  label={isAr ? "عمل عمودي ١" : "Vertical work 1"}
                  className="aspect-[9/16] w-full rounded-xl border border-border"
                />
              </Parallax>

              {/* Offset so the pair reads as layered depth, not a grid. */}
              <Parallax distance={-34} className="mt-10 sm:mt-16">
                <LazyVideo
                  src="/vid2-a6-9.mp4"
                  poster="/posters/vid2.jpg"
                  mode="ambient"
                  label={isAr ? "عمل عمودي ٢" : "Vertical work 2"}
                  className="aspect-[9/16] w-full rounded-xl border border-border"
                />
              </Parallax>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
