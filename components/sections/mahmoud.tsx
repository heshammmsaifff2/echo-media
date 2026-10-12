"use client";

import Image from "next/image";
import { Quote, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { founder } from "@/lib/brand";
import { Link } from "@/components/link";
import {
  StaggerContainer,
  StaggerItem,
  LineReveal,
  FadeIn,
} from "@/components/motion";
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

  const role = pick(heroS.field("role", founder.role));
  const name = pick(heroS.field("name", founder.name));
  const bio = pick(heroS.field("bio", founder.bio));
  const quote = pick(heroS.field("quote", founder.quote));

  // Determine the photo URL: CMS background image, poster, or founder photo fallback
  const photoUrl =
    (heroS.bg?.type === "image" && heroS.bg?.url)
      ? heroS.bg.url
      : heroS.bg?.poster || heroS.bg?.url || founder.photo || "https://res.cloudinary.com/ai39ujhm/image/upload/echo/site/posters/vid1.jpg";

  return (
    <>
      {/* ── Founder Profile Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-44 lg:pb-32">
        {/* Ambient atmospheric lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute top-1/4 start-1/4 h-[500px] w-[500px] rounded-full bg-[hsl(var(--echo-accent)/0.12)] blur-[120px]" />
          <div className="absolute top-1/3 end-10 h-[400px] w-[400px] rounded-full bg-[hsl(var(--echo-surface)/0.6)] blur-[100px]" />
          <div className="grain absolute inset-0 opacity-20" />
        </div>

        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            
            {/* Content Column: Text, Bio, Quote, Stats, Actions */}
            <div className="order-2 lg:order-1 lg:col-span-7">
              <FadeIn direction="up">
                {/* Executive status pill */}
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[hsl(var(--echo-accent)/0.3)] bg-[hsl(var(--echo-accent)/0.08)] px-4 py-1.5 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--echo-accent))] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--echo-accent))]" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-bright">
                    {role}
                  </span>
                </div>

                {/* Name */}
                <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-bright sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08]">
                  <LineReveal lines={[name]} delay={0.1} />
                </h1>

                {/* Bio paragraph */}
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {bio}
                </p>

                {/* Signature quote block */}
                <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-surface/40 p-6 sm:p-7 backdrop-blur-md">
                  <div className="absolute top-4 end-5 text-[hsl(var(--echo-accent)/0.25)]">
                    <Quote className="h-10 w-10 rotate-180" />
                  </div>
                  <p className="relative z-10 text-base font-medium italic leading-relaxed text-bright sm:text-lg">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-0.5 w-6 bg-[hsl(var(--echo-accent))]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {name}
                    </span>
                  </div>
                </div>

                {/* Fast Credential Badges */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className="rounded-xl border border-white/5 bg-surface/30 p-4">
                    <p className="text-2xl font-bold text-bright">10+</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isAr ? "سنوات خبرة سينمائية" : "Years Experience"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-surface/30 p-4">
                    <p className="text-2xl font-bold text-bright">150+</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isAr ? "مشروع وعمل إعلاني" : "Projects Produced"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-surface/30 p-4 col-span-2 sm:col-span-1">
                    <p className="text-2xl font-bold text-bright">Echo</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isAr ? "رؤية إبداعية مستقلة" : "Creative Direction"}
                    </p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--echo-accent))] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(var(--echo-accent)/0.25)] transition-all duration-300 hover:bg-[hsl(var(--echo-accent)/0.88)] hover:scale-[1.02] cursor-pointer"
                  >
                    <span>{isAr ? "تواصل مع محمود" : "Connect with Mahmoud"}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-bright transition-colors duration-300 hover:bg-white/10 cursor-pointer"
                  >
                    <span>{isAr ? "استعرض الأعمال" : "Explore Portfolio"}</span>
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Photo Column: Elegant Portrait Framing */}
            <div className="order-1 lg:order-2 lg:col-span-5">
              <FadeIn direction="none" delay={0.2}>
                <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
                  {/* Subtle ambient halo glow behind photo */}
                  <div
                    aria-hidden="true"
                    className="absolute -inset-3 sm:-inset-5 rounded-[2.5rem] bg-gradient-to-tr from-[hsl(var(--echo-accent)/0.35)] via-[hsl(var(--echo-accent)/0.12)] to-transparent blur-2xl -z-10"
                  />

                  {/* Framed card */}
                  <div className="group relative overflow-hidden rounded-[2rem] border border-white/15 bg-surface/60 p-2 sm:p-2.5 shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-[hsl(var(--echo-accent)/0.5)]">
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] w-full overflow-hidden rounded-[1.6rem] bg-surface">
                      <Image
                        src={photoUrl}
                        alt={name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Cinematic lighting scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--echo-base)/0.92)] via-[hsl(var(--echo-base)/0.25)] to-transparent" />

                      {/* Floating bottom glass badge on photo */}
                      <div className="absolute inset-x-3.5 bottom-3.5 sm:inset-x-4 sm:bottom-4 flex items-center justify-between rounded-xl border border-white/15 bg-[hsl(var(--echo-base)/0.8)] px-4 py-3 backdrop-blur-md">
                        <div>
                          <p className="text-xs font-bold text-bright">{name}</p>
                          <p className="text-[11px] text-muted-foreground">{role}</p>
                        </div>
                        <span className="rounded-full border border-[hsl(var(--echo-accent)/0.3)] bg-[hsl(var(--echo-accent)/0.15)] px-2.5 py-1 text-[10px] font-mono font-medium text-[hsl(var(--echo-accent))]">
                          ECHO MEDIA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

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
