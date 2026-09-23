"use client";

import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { goal, cta } from "@/lib/brand";
import { FadeIn, LineRevealInView } from "@/components/motion";
import { MediaPanel, PanelTag } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";
import { ArrowRight } from "lucide-react";

/** The 2030 ambition, framed as the question and the one-word answer. */
export function GoalSection() {
  const { pick } = useI18n();
  const { bg, field } = useSection("home.goal");

  return (
    <MediaPanel
      bg={bg}
      label="2030"
      overlay="strong"
      align="center"
      minH="screen"
      contentClassName="items-center text-center"
    >
      <FadeIn>
        <span className="eyebrow text-bright/70">{pick(field("label", goal.label))}</span>
      </FadeIn>

      <p className="display-md mx-auto mt-10 max-w-3xl text-foreground/85">
        {pick(field("question", goal.question))}
      </p>

      <div className="mt-10">
        <h2
          className="display-xl text-bright drop-shadow-[0_2px_40px_rgba(0,0,0,0.6)]"
          dir="ltr"
        >
          <LineRevealInView lines={[pick(field("answer", goal.answer))]} />
        </h2>
      </div>
    </MediaPanel>
  );
}

export function CtaSection() {
  const { pick, isAr } = useI18n();
  const { bg, field } = useSection("global.cta");
  const tag = field("tag", { en: "Let's talk", ar: "لنبدأ" });

  return (
    <MediaPanel
      bg={bg}
      label="Start a project"
      overlay="strong"
      align="center"
      minH="large"
    >
      <PanelTag>{pick(tag)}</PanelTag>

      <h2 className="display-lg max-w-4xl text-bright drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
        <LineRevealInView lines={[pick(field("heading", cta.heading))]} />
      </h2>

      <FadeIn delay={0.12}>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/85">
          {pick(field("body", cta.body))}
        </p>

        <Link
          href={cta.href}
          className="group mt-12 inline-flex items-center gap-3 rounded-full bg-[hsl(var(--echo-accent))] px-9 py-4 text-base font-semibold text-[hsl(var(--echo-base))] transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
        >
          {pick(field("button", cta.button))}
          <ArrowRight
            size={19}
            className={`transition-transform duration-300 ${
              isAr
                ? "rotate-180 group-hover:-translate-x-1"
                : "group-hover:translate-x-1"
            }`}
          />
        </Link>
      </FadeIn>
    </MediaPanel>
  );
}
