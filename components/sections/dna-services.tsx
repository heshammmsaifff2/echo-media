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
  Layers,
  Cpu,
  Play,
  Dna,
} from "lucide-react";
import { Link } from "@/components/link";

type ServiceStrand = {
  id: string;
  strandNumber: string;
  icon: typeof Film;
  title_ar: string;
  title_en: string;
  tagline_ar: string;
  tagline_en: string;
  description_ar: string;
  description_en: string;
  color: string;
  nodes: {
    number: string;
    label_ar: string;
    label_en: string;
    detail_ar: string;
    detail_en: string;
  }[];
  deliverables_ar: string[];
  deliverables_en: string[];
};

const STRANDS: ServiceStrand[] = [
  {
    id: "brand-films",
    strandNumber: "01",
    icon: Film,
    title_ar: "أفلام العلامات التجارية",
    title_en: "Brand Films",
    tagline_ar: "سرد سينمائي يخلد قصة هويتك",
    tagline_en: "Cinematic narrative that immortalizes your brand story",
    description_ar:
      "القوس الكامل لقصة عن هويتك ورؤيتك — من البحث الأولى وكتابة السيناريو حتى التصوير السينمائي والمعالجة اللونية بمقاييس عالمية.",
    description_en:
      "The complete arc of a story about who you are and where you're heading — researched, written, shot, and graded with cinema-grade excellence.",
    color: "#38bdf8",
    nodes: [
      {
        number: "01",
        label_ar: "البحث وتحليل الهوية",
        label_en: "Brand Discovery",
        detail_ar: "جلسة معمقة لفهم جوهر العلامة والجمهور المستهدف",
        detail_en: "Deep-dive session extracting core identity & audience",
      },
      {
        number: "02",
        label_ar: "الفكرة والسيناريو الإبداعي",
        label_en: "Concept & Script",
        detail_ar: "بناء قصة ذات مغزى وحوار يلامس الوجدان",
        detail_en: "Crafting emotional narrative & cinematic storyboard",
      },
      {
        number: "03",
        label_ar: "الإنتاج والتصوير السينمائي",
        label_en: "Cinema Production",
        detail_ar: "كاميرات سينمائية وعدسات برايم وإضاءة احترافية",
        detail_en: "Cinema cameras, prime lenses & dramatic lighting",
      },
      {
        number: "04",
        label_ar: "المونتاج والتلوين والصوت",
        label_en: "Post & Color Grading",
        detail_ar: "معالجة لونية دقيقة ومكساج صوتي مخصص",
        detail_en: "Frame-accurate editing, color grading & custom score",
      },
    ],
    deliverables_ar: ["ماستر سينمائي بدقة 4K", "نسخ مخصصة لمنصات التواصل", "موسيقى وتصميم صوتي أصلي"],
    deliverables_en: ["4K Cinema Master", "Social Media Cutdowns", "Original Audio & Sound Design"],
  },
  {
    id: "commercials",
    strandNumber: "02",
    icon: Clapperboard,
    title_ar: "الإعلانات التجارية السينمائية",
    title_en: "Commercial Ads",
    tagline_ar: "تأثير مرئي مكثف يحقق نتيجة مبيعات",
    tagline_en: "High-impact visual execution engineered for conversion",
    description_ar:
      "عمل تجاري مكثف وعالي الطاقة مبني لبيع نتيجة وجذب انتباه العميل في الثواني الأولى، لا لملء فراغ إعلاني.",
    description_en:
      "High-energy, conversion-driven commercial spots engineered to stop the scroll and drive immediate action, not just fill ad inventory.",
    color: "#60a5fa",
    nodes: [
      {
        number: "01",
        label_ar: "الرؤية الإخراجية والستوري بورد",
        label_en: "Creative Direction",
        detail_ar: "صياغة فكرة جريئة تخطف الأنظار في أول 3 ثوانٍ",
        detail_en: "Bold hook formulation that captures attention immediately",
      },
      {
        number: "02",
        label_ar: "التصوير الميداني السريع",
        label_en: "High-Speed Shooting",
        detail_ar: "حركات كاميرا ديناميكية وإضاءة تسويقية براقة",
        detail_en: "Dynamic camera motion & crisp product lighting",
      },
      {
        number: "03",
        label_ar: "الموشن جرافيك والمؤثرات",
        label_en: "Motion Graphics & VFX",
        detail_ar: "تصاميم بصرية ثلاثية الأبعاد وعناصر تفاعلية",
        detail_en: "3D typography, kinetic titles & visual effects",
      },
      {
        number: "04",
        label_ar: "تصميم الصوت الإيقاعي",
        label_en: "Dynamic Audio Mix",
        detail_ar: "إيقاع صوتي محفز يعزز قرار الشراء",
        detail_en: "Punchy sound effects & broadcast mastering",
      },
    ],
    deliverables_ar: ["إعلانات عمودية (9:16) وأفقية (16:9)", "اختبارات A/B للمقدمات", "ملفات جاهزة للحملات الممولة"],
    deliverables_en: ["Vertical (9:16) & Wide (16:9)", "A/B Hook Variations", "Ad-Ready Campaign Assets"],
  },
  {
    id: "podcast",
    strandNumber: "03",
    icon: Mic,
    title_ar: "إنتاج البودكاست الاستوديو",
    title_en: "Podcast Production",
    tagline_ar: "منظومة إنتاج كاملة في استوديو معالج",
    tagline_en: "Full show pipeline in our acoustically treated studio",
    description_ar:
      "استوديو آرت هاوس المجهز صوتياً وبصرياً — نصنع لك برنامج بودكاست بمعايير البث التلفزيوني من البلاتوه إلى المقاطع الفيروسية.",
    description_en:
      "State-of-the-art Art House Studio production — taking your show from high-fidelity set recording to viral short clips across all channels.",
    color: "#818cf8",
    nodes: [
      {
        number: "01",
        label_ar: "الاستوديو والديكور المخصص",
        label_en: "Acoustic Studio Setup",
        detail_ar: "عزل صوتي كامل وإضاءة سينمائية مريحة للضيوف",
        detail_en: "Acoustic isolation, customizable sets & ambient lighting",
      },
      {
        number: "02",
        label_ar: "تصوير متعدد الكاميرات 4K",
        label_en: "3-Camera Multi-Angle",
        detail_ar: "3 كاميرات سينمائية لتغطية المحاور والضيوف",
        detail_en: "Multi-angle coverage switching seamlessly in 4K",
      },
      {
        number: "03",
        label_ar: "هندسة الصوت المباشر",
        label_en: "Broadcast Microphones",
        detail_ar: "ميكروفونات شات عالمية ونقاء صوت استثنائي",
        detail_en: "Shure SM7B mics with real-time compression & DSP",
      },
      {
        number: "04",
        label_ar: "المونتاج والشورتس الفيروسي",
        label_en: "Shorts & Viral Clips",
        detail_ar: "تقطيع أقوى اللحظات مع كتابة نصوص احترافية",
        detail_en: "Subtitled highlight reels ready for TikTok & Reels",
      },
    ],
    deliverables_ar: ["حلقات كاملة بدقة 4K", "مقاطع ريلز وشورتس أسبوعية", "صور مصغرة (Thumbnails) جذابة"],
    deliverables_en: ["Full 4K Episodes", "Weekly Viral Shorts", "High-CTR Custom Thumbnails"],
  },
  {
    id: "strategy",
    strandNumber: "04",
    icon: Lightbulb,
    title_ar: "الاستراتيجية الإبداعية والتموضع",
    title_en: "Creative Strategy",
    tagline_ar: "نحن نفكر قبل أن نصوّر",
    tagline_en: "We think before we shoot",
    description_ar:
      "لا نطلق الكاميرا إلا بعد فهم عميق للعلامة وتحليل الجمهور واستخراج الرسالة الجوهرية. تدفع مقابل الفكر والابتكار لا مجرد ساعات التصوير.",
    description_en:
      "Before a camera comes out, there's a discovery session, audience analysis, and message extraction. You invest in creative clarity.",
    color: "#38bdf8",
    nodes: [
      {
        number: "01",
        label_ar: "جلسة اكتشاف العلامة",
        label_en: "Discovery Workshop",
        detail_ar: "تحديد نقاط القوة والرسائل التنافسية للبراند",
        detail_en: "Unearthing brand advantages and authentic positioning",
      },
      {
        number: "02",
        label_ar: "تحليل سيكولوجيا الجمهور",
        label_en: "Audience Psychology",
        detail_ar: "فهم دوافع العميل واحتياجاته العاطفية والعملية",
        detail_en: "Mapping customer desires, pain points and triggers",
      },
      {
        number: "03",
        label_ar: "صياغة الرسالة الجوهرية",
        label_en: "Core Message Crafting",
        detail_ar: "بلورة رسالة واضحة لا تقبل النسيان في كلمة وفكرة",
        detail_en: "Distilling one unforgettable, definitive proposition",
      },
      {
        number: "04",
        label_ar: "التوجيه البصري والحملات",
        label_en: "Campaign Roadmap",
        detail_ar: "خارطة طريق كاملة لإنتاج المحتوى المؤثر",
        detail_en: "Actionable production blueprint and aesthetic bible",
      },
    ],
    deliverables_ar: ["دليل التموضع الاستراتيجي", "ملف الأفكار والسيناريوهات", "خطة إنتاج متكاملة"],
    deliverables_en: ["Strategic Positioning Guide", "Campaign Narrative Concepts", "Full Production Roadmap"],
  },
];

export function DnaServicesSection() {
  const { isAr } = useI18n();
  const [activeStrandId, setActiveStrandId] = useState<string>("brand-films");

  const currentStrand =
    STRANDS.find((s) => s.id === activeStrandId) || STRANDS[0];

  return (
    <section className="relative overflow-hidden bg-transparent py-28 sm:py-36">
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
                {isAr ? "الحمض النووي والخدمات" : "Services DNA"}
              </span>
            </div>

            <h2 className="display-lg mt-6 text-bright text-balance">
              {isAr
                ? "كل خدمة هي مسار إبداعي متصل"
                : "Every Service Is an Interconnected Strand"}
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground text-balance">
              {isAr
                ? "ليست خدماتنا مجرد بنود في فاتورة، بل منظومات إنتاج حية مبنية كالهيليكس المتشابك لضمان أعلى أثر سينمائي."
                : "Not line items on an invoice — living production systems engineered like an interconnected helix for lasting impact."}
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
                <span>{isAr ? strand.title_ar : strand.title_en}</span>
                <span className="font-mono text-[10px] text-white/40">
                  {strand.strandNumber}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Interactive DNA Biological Strand Display ─────────────────── */}
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#040816]/90 via-[#020614]/85 to-[#01030a]/95 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
          
          {/* Internal Strand Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400 px-2.5 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/20">
                  STRAND {currentStrand.strandNumber}
                </span>
                <span className="text-xs text-white/50">
                  {isAr ? currentStrand.tagline_ar : currentStrand.tagline_en}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {isAr ? currentStrand.title_ar : currentStrand.title_en}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isAr ? currentStrand.description_ar : currentStrand.description_en}
              </p>
            </div>

            {/* CTA action */}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 px-6 py-3 text-xs sm:text-sm font-semibold transition-all hover:scale-105 shrink-0 self-start lg:self-center cursor-pointer shadow-md"
            >
              <Sparkles size={14} />
              <span>{isAr ? "ابدأ هذا المشروع معنا" : "Start This Project"}</span>
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
                    {isAr ? node.label_ar : node.label_en}
                  </h4>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {isAr ? node.detail_ar : node.detail_en}
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
              {(isAr
                ? currentStrand.deliverables_ar
                : currentStrand.deliverables_en
              ).map((deliv, i) => (
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

