"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { founder } from "@/lib/brand";
import {
  StaggerContainer,
  StaggerItem,
  LineReveal,
  Parallax,
} from "@/components/motion";
import { CtaSection } from "@/components/sections/closing";

export function MahmoudContent() {
  const { pick } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pt-40 pb-24 sm:pt-48 sm:pb-32 grain">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[760px] max-w-[110vw] -translate-x-1/2 rounded-full bg-[hsl(var(--echo-accent))] opacity-[0.13] blur-[150px]"
        />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Parallax distance={28}>
                <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface">
                  {founder.photo ? (
                    <Image
                      src={founder.photo}
                      alt={pick(founder.name)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 90vw, 40vw"
                      priority
                    />
                  ) : (
                    /* Monogram placeholder until a portrait is supplied. */
                    <div className="absolute inset-0 grid place-items-center">
                      <span
                        className="display-lg text-[hsl(var(--echo-line))]"
                        dir="ltr"
                      >
                        MM
                      </span>
                    </div>
                  )}
                </div>
              </Parallax>
            </div>

            <div className="lg:col-span-7">
              <p className="eyebrow mb-8">{pick(founder.role)}</p>
              <h1 className="display-lg text-bright">
                <LineReveal lines={[pick(founder.name)]} delay={0.15} />
              </h1>
              <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {pick(founder.bio)}
              </p>

              <blockquote className="mt-12 border-s-2 border-[hsl(var(--echo-accent))] ps-6">
                <p className="text-xl leading-relaxed text-bright sm:text-2xl">
                  {pick(founder.quote)}
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-28 sm:py-40">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mb-16 flex items-center gap-6">
            <span className="eyebrow whitespace-nowrap">
              {pick(founder.focus.heading)}
            </span>
            <span className="rule" />
          </div>

          <StaggerContainer className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {founder.focus.items.map((item, i) => (
              <StaggerItem key={i} className="group bg-background">
                <div className="h-full p-10 transition-colors duration-500 group-hover:bg-surface sm:p-12">
                  <span className="font-mono text-xs text-[hsl(var(--echo-accent))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold text-bright">
                    {pick(item.title)}
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

      <CtaSection />
    </>
  );
}
