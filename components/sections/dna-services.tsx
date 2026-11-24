"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { FadeIn } from "@/components/motion";
import {
  Film,
  Sparkles,
  Clapperboard,
  Mic,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Dna,
} from "lucide-react";
import { Link } from "@/components/link";

import { useSection } from "@/components/content-provider";
import { servicesDna } from "@/lib/brand";

/** Icons cycle by position so any number of services gets one. */
const ICONS = [Film, Clapperboard, Mic, Lightbulb];

type Row = Record<string, string>;
type Strand = {
  id: string;
  strandNumber: string;
  icon: typeof Film;
  title: string;
  tagline: string;
  description: string;
  nodes: { number: string; label: string; detail: string }[];
  deliverables: string[];
};

const lines = (v: string | undefined) => (v ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

/** Admin rows (or the brand defaults) → what the section renders. */
function toStrands(rows: Row[]): Strand[] {
  return rows
    .filter((r) => (r.title ?? "").trim())
    .map((r, i) => ({
      id: `strand-${i}`,
      strandNumber: String(i + 1).padStart(2, "0"),
      icon: ICONS[i % ICONS.length],
      title: r.title ?? "",
      tagline: r.tagline ?? "",
      description: r.description ?? "",
      // "Step title | detail" — the detail part is optional.
      nodes: lines(r.steps).map((l, j) => {
        const [label, ...rest] = l.split("|");
        return { number: String(j + 1).padStart(2, "0"), label: label.trim(), detail: rest.join("|").trim() };
      }),
      deliverables: lines(r.deliverables),
    }));
}

export function DnaServicesSection() {
  const { isAr, pick } = useI18n();
  const { field } = useSection("home.services");
  const fallback = {
    en: servicesDna.items.map((it) => Object.fromEntries(Object.entries(it).map(([k, v]) => [k, v.en]))),
    ar: servicesDna.items.map((it) => Object.fromEntries(Object.entries(it).map(([k, v]) => [k, v.ar]))),
  };
  const rows = field<{ en: Row[]; ar: Row[] }>("items", fallback);
  const STRANDS = toStrands((isAr ? rows.ar : rows.en) ?? []);
  const [activeStrandId, setActiveStrandId] = useState<string>("strand-0");

  const currentStrand = STRANDS.find((s) => s.id === activeStrandId) || STRANDS[0];
  if (!currentStrand) return null;

  return (
    <section className="relative overflow-hidden bg-transparent py-20 sm:py-24">
      {/* Subtle organic ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] max-w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(56,189,248,0.1) 0%, rgba(30,58,138,0.05) 50%, transparent 75%)",
          transform: "translate3d(0, 0, 0)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
        
        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-20">
          <FadeIn direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--echo-accent)/0.3)] bg-[hsl(var(--echo-accent)/0.1)] px-4 py-1.5">
              <Dna className="h-3.5 w-3.5 text-[hsl(var(--echo-accent))] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-bright">
                {pick(field("label", servicesDna.label))}
              </span>
            </div>

            <h2 className="display-lg mt-6 text-bright text-balance">
              {pick(field("heading", servicesDna.heading))}
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground text-balance">
              {pick(field("body", servicesDna.body))}
            </p>
          </FadeIn>
        </div>

        {/* ── Strand Navigator Pills ───────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-12 sm:mb-16">
          {STRANDS.map((strand) => {
            const Icon = strand.icon;
            const isSelected = strand.id === activeStrandId;

            return (
              <button
                key={strand.id}
                type="button"
                onClick={() => setActiveStrandId(strand.id)}
                className={`group relative inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border border-sky-400/50 bg-gradient-to-r from-sky-500/20 via-sky-400/10 to-transparent text-white shadow-lg shadow-sky-500/20 scale-[1.02]"
                    : "border border-white/10 bg-surface/50 text-muted-foreground hover:border-white/25 hover:text-white hover:bg-surface"
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                    isSelected
                      ? "bg-sky-400 text-black shadow-sm"
                      : "bg-white/10 text-white/70 group-hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                </span>
                <span>{strand.title}</span>
                <span className="font-mono text-[10px] text-white/40">
                  {strand.strandNumber}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Interactive DNA Biological Strand Display ─────────────────── */}
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#040816]/90 via-[#020614]/85 to-[#01030a]/95 p-6 sm:p-10 lg:p-12 shadow-2xl">
          
          {/* Internal Strand Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400 px-2.5 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/20">
                  STRAND {currentStrand.strandNumber}
                </span>
                <span className="text-xs text-white/50">
                  {currentStrand.tagline}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {currentStrand.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {currentStrand.description}
              </p>
            </div>

            {/* CTA action */}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 px-6 py-3 text-xs sm:text-sm font-semibold transition-all hover:scale-105 shrink-0 self-start lg:self-center cursor-pointer shadow-md"
            >
              <Sparkles size={14} />
              <span>{pick(field("cta", servicesDna.cta))}</span>
              <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
            </Link>
          </div>

          {/* DNA Helix Node Pipeline Flow */}
          <div className="relative">
            {/* Visual DNA Connecting Spine (Desktop) */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[3px] bg-gradient-to-r from-sky-500/20 via-sky-400/50 to-indigo-500/20 -z-10"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {currentStrand.nodes.map((node, idx) => (
                <div
                  key={node.number}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 transition-all duration-300 hover:border-sky-400/50 hover:bg-white/[0.06] hover:-translate-y-1 shadow-lg"
                >
                  {/* Glowing Node Marker */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/20 font-mono text-xs font-bold text-sky-300">
                        {node.number}
                        <span className="absolute -inset-0.5 rounded-full border border-sky-400/30 animate-ping opacity-30" />
                      </span>
                      <span className="font-mono text-[11px] text-white/40 tracking-wider">
                        NODE {idx + 1}
                      </span>
                    </div>

                    <div className="h-2 w-2 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Node Title & Description */}
                  <h4 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {node.label}
                  </h4>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {node.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Strand Deliverables Bar */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
              <span>{isAr ? "مخرجات الباقة المعتمدة:" : "Included Deliverables:"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentStrand.deliverables.map((deliv, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  {deliv}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

