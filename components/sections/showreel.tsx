"use client";

import { useI18n } from "@/lib/i18n";
import { style } from "@/lib/brand";
import { LazyVideo } from "@/components/lazy-video";
import { useSection } from "@/components/content-provider";
import {
  FadeIn,
  Parallax,
  StaggerContainer,
  StaggerItem,
  LineRevealInView,
} from "@/components/motion";

/** Cloudinary videos can serve a still frame as a poster by swapping the ext. */
function posterFor(url: string): string | undefined {
  if (url && url.includes("/video/upload/")) {
    return url.replace(/\.(mp4|mov|webm|m4v|avi|mkv)(\?|$)/i, ".jpg$2");
  }
  return undefined;
}

const LIGHTING_DEFAULT = {
  heading: {
    en: "Intentional lighting. Crafted for impact.",
    ar: "إضاءة مدروسة. تصنع الفارق.",
  },
  body: {
    en: "Lighting isn't just about visibility — it's what shapes cinematic depth, mood, and visual identity.",
    ar: "الإضاءة ليست مجرد وضوح للمشهد، بل هي ما يمنح الكادر عمقه السينمائي وهويته البصرية المميزة.",
  },
  video1: "https://res.cloudinary.com/ai39ujhm/video/upload/echo/site/vid1-16-9.mp4",
  video2: "https://res.cloudinary.com/ai39ujhm/video/upload/echo/site/vid2-a6-9.mp4",
};

/**
 * The lighting beat — the message beside a pair of vertical videos layered with
 * parallax so it reads in depth. Both videos are editable from the admin panel.
 */
export function LightingSection() {
  const { pick, isAr } = useI18n();
  const { field } = useSection("home.lighting");

  const heading = pick(field("heading", LIGHTING_DEFAULT.heading));
  const body = pick(field("body", LIGHTING_DEFAULT.body));
  const video1 = field("video1", LIGHTING_DEFAULT.video1);
  const video2 = field("video2", LIGHTING_DEFAULT.video2);

  return (
    <section className="relative overflow-hidden border-t border-border bg-surface py-28 sm:py-36 grain">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <h3 className="display-md text-bright">{heading}</h3>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{body}</p>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-5 sm:gap-8">
              <Parallax distance={34}>
                <LazyVideo
                  src={video1}
                  poster={posterFor(video1)}
                  mode="ambient"
                  label={isAr ? "عمل عمودي ١" : "Vertical work 1"}
                  className="aspect-[9/16] w-full rounded-xl border border-border"
                />
              </Parallax>

              {/* Offset so the pair reads as layered depth, not a grid. */}
              <Parallax distance={-34} className="mt-10 sm:mt-16">
                <LazyVideo
                  src={video2}
                  poster={posterFor(video2)}
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


/**
 * The Echo style — the six things every film that leaves this house carries.
 * Shown as one oversized editorial line-up (no grid, no boxes): big numbered
 * words that read like a title sequence over the ambient loop.
 */
export function ShowreelSection() {
  const { pick } = useI18n();
  const { bg, field } = useSection("home.style");
  const steps = pick(field("steps", style.steps));
  const bandVideo = bg.type === "video" && bg.url ? bg.url : undefined;
  const bandImage = bg.type === "image" && bg.url ? bg.url : undefined;

  return (
    <section className="relative border-t border-border bg-background py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-14 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(field("label", style.label))}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg max-w-4xl text-bright">
          <LineRevealInView lines={[pick(field("heading", style.heading))]} />
        </h2>

        <FadeIn delay={0.1}>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            {pick(field("body", style.body))}
          </p>
        </FadeIn>
      </div>

      {/* Cinematic frame — aligned with the section, not edge-to-edge. */}
      {(bandVideo || bandImage) && (
        <div className="mx-auto mt-14 max-w-[1400px] px-6 sm:px-10">
          <FadeIn direction="none">
            <div className="relative overflow-hidden rounded-2xl border border-border">
              {bandVideo ? (
                <LazyVideo
                  src={bandVideo}
                  poster={bg.poster ?? undefined}
                  mode="ambient"
                  fit="contain"
                  label="Echo showreel"
                  className="aspect-video w-full"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bandImage} alt="" className="aspect-video w-full object-cover" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          </FadeIn>
        </div>
      )}

      {/* The six — clean oversized type, no boxes. */}
      <div className="mx-auto mt-20 max-w-[1400px] px-6 sm:px-10">
        <StaggerContainer
          className="flex flex-wrap items-baseline gap-x-10 gap-y-6"
          staggerDelay={0.06}
        >
          {steps.map((step, i) => (
            <StaggerItem key={i}>
              <span className="inline-flex items-baseline gap-3">
                <span className="font-mono text-sm text-[hsl(var(--echo-accent))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-3xl font-bold leading-none text-bright sm:text-5xl">
                  {step}
                </span>
              </span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
