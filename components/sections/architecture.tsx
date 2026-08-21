"use client";

import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { architecture } from "@/lib/brand";
import { FadeIn, StaggerContainer, StaggerItem, LineRevealInView } from "@/components/motion";
import { ArrowUpRight } from "lucide-react";

export function ArchitectureSection() {
  const { pick, isAr } = useI18n();

  return (
    <section className="relative border-t border-border bg-background py-32 sm:py-44">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">
            {pick(architecture.label)}
          </span>
          <span className="rule" />
        </div>

        <h2 className="display-lg mb-20 max-w-3xl text-bright">
          <LineRevealInView lines={[pick(architecture.heading)]} />
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {architecture.divisions.map((division, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <Link
                href={division.href}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-10 transition-colors duration-500 hover:border-[hsl(var(--echo-accent))] sm:p-14 cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="eyebrow mb-4">{pick(division.tagline)}</p>
                      <h3 className="text-3xl font-bold leading-tight text-bright sm:text-4xl">
                        {pick(division.name)}
                      </h3>
                    </div>
                    <ArrowUpRight
                      size={26}
                      className={`shrink-0 text-muted-foreground transition-all duration-500 group-hover:text-[hsl(var(--echo-accent))] ${
                        isAr
                          ? "-scale-x-100 group-hover:-translate-x-1"
                          : "group-hover:translate-x-1"
                      } group-hover:-translate-y-1`}
                    />
                  </div>
                </div>

                <StaggerContainer className="mt-14 space-y-0" staggerDelay={0.05}>
                  {pick(division.items).map((item, s) => (
                    <StaggerItem key={s}>
                      <div className="flex items-center gap-4 border-t border-border py-4">
                        <span className="h-1 w-1 rounded-full bg-[hsl(var(--echo-accent))]" />
                        <span className="text-base text-foreground">{item}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
