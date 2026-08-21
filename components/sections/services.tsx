"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { services } from "@/lib/brand";
import { FadeIn, LineRevealInView, motion } from "@/components/motion";
import { Plus } from "lucide-react";

export function ServicesSection() {
  const { pick, isAr } = useI18n();
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="relative border-t border-border bg-background py-32 sm:py-44">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">{pick(services.label)}</span>
          <span className="rule" />
        </div>

        <h2 className="display-lg max-w-4xl text-bright">
          <LineRevealInView lines={[pick(services.heading)]} />
        </h2>

        <FadeIn delay={0.1}>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            {pick(services.body)}
          </p>
        </FadeIn>

        <div className="mt-20 border-t border-border">
          {services.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-10 text-start cursor-pointer"
                >
                  <span className="flex items-baseline gap-6 sm:gap-10">
                    <span className="font-mono text-xs text-[hsl(var(--echo-accent))]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`display-md transition-colors duration-300 ${
                        isOpen
                          ? "text-bright"
                          : "text-muted-foreground group-hover:text-bright"
                      }`}
                    >
                      {pick(item.name)}
                    </span>
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="shrink-0 text-muted-foreground group-hover:text-bright"
                  >
                    <Plus size={26} strokeWidth={1.25} />
                  </motion.span>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-10 pb-12 lg:grid-cols-12">
                    <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-5 lg:col-start-2">
                      {pick(item.body)}
                    </p>

                    <div className="lg:col-span-6">
                      <p className="eyebrow mb-5">
                        {isAr ? "ما تشمله الباقة" : "What the package includes"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                        {pick(item.steps).map((step, s, arr) => (
                          <span key={s} className="flex items-center gap-2">
                            <span className="rounded-full border border-border px-4 py-2 text-sm text-foreground">
                              {step}
                            </span>
                            {s < arr.length - 1 && (
                              <span
                                aria-hidden="true"
                                className="text-[hsl(var(--echo-accent))]"
                              >
                                {isAr ? "←" : "→"}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
