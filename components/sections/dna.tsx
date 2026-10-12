"use client";

import { useI18n } from "@/lib/i18n";
import { dna } from "@/lib/brand";
import { FadeIn } from "@/components/motion";
import { useSection } from "@/components/content-provider";

/**
 * DnaSection — "Why We Exist"
 *
 * An editorial, high-impact poster card embodying Echo's creative philosophy:
 *  - Top: Tagline ("TO CREATE FILMS THAT MAKE BRANDS IMPOSSIBLE TO IGNORE.") & Version ("V1.0").
 *  - Center: Giant translucent "DNA" backdrop watermark with "Why We Exist?" headline and manifesto text.
 *  - Bottom: Copyright notice & Echo brand sign-off.
 *  - Admin CMS: 100% editable fields & optional custom background media.
 */
export function DnaSection() {
  const { pick, isAr } = useI18n();
  const { bg, field } = useSection("home.dna");

  const tagline = pick(field("tagline", dna.tagline));
  const version = pick(field("version", dna.version));
  const badge = pick(field("badge", dna.badge));
  const question = pick(field("question", dna.question));
  const body = pick(field("body", dna.body));
  const copyright = pick(field("copyright", dna.copyright));
  const brandNote = pick(field("brandNote", dna.brandNote));

  return (
    <section className="relative overflow-hidden bg-transparent py-24 sm:py-36">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <FadeIn direction="up">
          {/* ── Editorial Poster Card Enclosure ────────────────────────────── */}
          <div
            className="group relative min-h-[640px] sm:min-h-[740px] lg:min-h-[820px] overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-[#040816] via-[#020510] to-[#01030a] p-7 sm:p-12 lg:p-16 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col justify-between"
            style={{
              transform: "translate3d(0, 0, 0)",
              contain: "paint layout",
              backfaceVisibility: "hidden",
            }}
          >
            
            {/* Ambient Internal Light Aura & Dynamic Streaks (Pure hardware-accelerated radial gradients without costly blur filters) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-[550px] w-[550px] sm:h-[650px] sm:w-[650px] rounded-full -z-10"
              style={{
                background: "radial-gradient(circle closest-side, rgba(14,165,233,0.22) 0%, rgba(6,182,212,0.1) 40%, rgba(6,182,212,0.03) 70%, transparent 100%)",
                transform: "translate3d(0, 0, 0)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-12 right-0 h-[450px] w-[450px] sm:h-[550px] sm:w-[550px] rounded-full -z-10"
              style={{
                background: "radial-gradient(circle closest-side, rgba(59,130,246,0.16) 0%, rgba(37,99,235,0.06) 45%, transparent 100%)",
                transform: "translate3d(0, 0, 0)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/3 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full -z-10"
              style={{
                background: "radial-gradient(circle closest-side, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.03) 55%, transparent 100%)",
                transform: "translate3d(0, 0, 0)",
              }}
            />

            {/* Optional background media configured via admin */}
            {bg.url && (
              bg.type === "video" ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={bg.url}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 -z-10"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bg.url}
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 -z-10"
                />
              )
            )}

            {/* ── Top Header Row ────────────────────────────────────────────── */}
            <div className="relative z-10 flex items-start justify-between gap-6">
              <p
                className="max-w-[280px] sm:max-w-md text-[11px] sm:text-xs md:text-sm font-mono uppercase tracking-[0.18em] sm:tracking-[0.24em] text-white/80 leading-relaxed"
                dir={isAr ? "rtl" : "ltr"}
              >
                {tagline}
              </p>

              <span className="shrink-0 font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white/50">
                {version}
              </span>
            </div>

            {/* ── Center Content Area ────────────────────────────────────────── */}
            <div className="relative z-10 my-16 sm:my-20">
              {/* Giant "DNA" Watermark Behind */}
              <div
                aria-hidden="true"
                className="pointer-events-none select-none text-[32vw] sm:text-[24vw] md:text-[20rem] lg:text-[24rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-sky-300/10 to-transparent -mb-16 sm:-mb-24 md:-mb-32 translate-y-4"
                dir="ltr"
              >
                {badge}
              </div>

              {/* Foreground Focus: Headline & Narrative Manifesto */}
              <div className="relative z-20 max-w-3xl">
                <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white">
                  {question}
                </h2>

                <p className="mt-6 sm:mt-8 text-base sm:text-xl md:text-2xl font-normal leading-relaxed text-slate-200/90 max-w-2xl text-balance">
                  {body}
                </p>
              </div>
            </div>

            {/* ── Bottom Footer Row ─────────────────────────────────────────── */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-white/10 pt-6 sm:pt-8">
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/50">
                {copyright}
              </p>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-white/80">
                <span className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--echo-accent))]" />
                <span>{brandNote}</span>
              </div>
            </div>

          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// Keep export for backwards compatibility
export { DnaSection as GoalSection };
