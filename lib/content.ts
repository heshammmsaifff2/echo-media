/**
 * Editable site content.
 *
 * Every public section has a slug. The database table `section_content` stores,
 * per slug, a background (image/video from Cloudinary) and a `content` JSON blob
 * that overrides the code defaults in lib/brand.ts. Anything left empty falls
 * back to the brand defaults, so the site always renders.
 *
 * This file is the single registry the admin editor and the seed both read, and
 * it exposes pure helpers the section components use to merge DB over defaults.
 */

import {
  hero,
  style,
  clients,
  goal,
  cta,
  artHouse,
  founder,
  brand,
  type Bi,
  type BiList,
} from "@/lib/brand";

export type BgType = "image" | "video" | "none";

export type SectionBg = {
  type: BgType;
  url: string | null;
  poster: string | null;
};

export type SectionRow = {
  slug: string;
  content: Record<string, unknown>;
  bg_type: BgType | null;
  bg_url: string | null;
  bg_poster_url: string | null;
  bg_public_id: string | null;
};

/** A single editable field inside a section's content blob. */
export type FieldType = "bi" | "biLong" | "biList" | "biObjList";

export type ObjField = { id: string; label: Bi; long?: boolean };

export type FieldDef = {
  id: string;
  label: Bi;
  type: FieldType;
  /** Default value, referenced from brand.ts so there is one source of truth. */
  def: Bi | BiList | { en: Record<string, string>[]; ar: Record<string, string>[] } | unknown;
  /** For biObjList: the sub-fields of each row. */
  itemFields?: ObjField[];
};

export type SectionDef = {
  slug: string;
  page: "home" | "studio" | "founder" | "global";
  label: Bi;
  /** false = no background media (e.g. the logo card uses a fixed treatment). */
  media: boolean;
  defaultBg: SectionBg;
  fields: FieldDef[];
};

const L = (en: string, ar: string): Bi => ({ en, ar });

/** Turn brand's list-of-{name/title,body} into the editor's {en[],ar[]} shape. */
function objList(
  items: readonly { [k: string]: Bi }[],
  keys: string[]
): { en: Record<string, string>[]; ar: Record<string, string>[] } {
  return {
    en: items.map((it) => Object.fromEntries(keys.map((k) => [k, it[k].en]))),
    ar: items.map((it) => Object.fromEntries(keys.map((k) => [k, it[k].ar]))),
  };
}

/**
 * The section registry. Order here is the order shown in the admin editor.
 * `defaultBg` mirrors the media each section ships with in code.
 */
export const SECTIONS: SectionDef[] = [
  /* ── Home ── */
  {
    slug: "home.hero",
    page: "home",
    label: L("Hero", "الواجهة"),
    media: true,
    defaultBg: { type: "video", url: "/final.mp4", poster: "/posters/final.jpg" },
    fields: [
      { id: "eyebrow", label: L("Eyebrow", "سطر علوي"), type: "bi", def: hero.eyebrow },
      { id: "headline", label: L("Headline (one line per row)", "العنوان (سطر لكل صف)"), type: "biList", def: hero.headline },
      { id: "body", label: L("Body", "النص"), type: "biLong", def: hero.body },
      { id: "ctaPrimary", label: L("Primary button", "الزر الأساسي"), type: "bi", def: hero.ctaPrimary },
      { id: "ctaSecondary", label: L("Secondary button", "الزر الثانوي"), type: "bi", def: hero.ctaSecondary },
    ],
  },
  {
    slug: "home.film",
    page: "home",
    label: L("Brand film (with sound)", "الفيلم (بصوت)"),
    media: true,
    defaultBg: { type: "video", url: "/final_2.mp4", poster: "/posters/final2.jpg" },
    fields: [
      { id: "tag", label: L("Tag", "الوسم"), type: "bi", def: L("Selected Work", "من أعمالنا") },
      { id: "title", label: L("Title", "العنوان"), type: "bi", def: L("Intentional lighting. Crafted for impact.", "إضاءة مدروسة. تصنع الفارق.") },
    ],
  },
  {
    slug: "home.style",
    page: "home",
    label: L("The Echo style", "أسلوب Echo"),
    media: true,
    defaultBg: { type: "video", url: "/vid1-16-9.mp4", poster: "/posters/vid1.jpg" },
    fields: [
      { id: "label", label: L("Label", "التصنيف"), type: "bi", def: style.label },
      { id: "heading", label: L("Heading", "العنوان"), type: "bi", def: style.heading },
      { id: "body", label: L("Body", "النص"), type: "biLong", def: style.body },
      { id: "steps", label: L("The six (one per row)", "الستة (واحد لكل صف)"), type: "biList", def: style.steps },
    ],
  },
  {
    slug: "home.logo",
    page: "home",
    label: L("Logo moment", "لحظة اللوجو"),
    media: true,
    defaultBg: { type: "image", url: "/posters/vid1.jpg", poster: null },
    fields: [
      { id: "motto", label: L("Motto", "الشعار"), type: "bi", def: L(brand.motto, brand.motto) },
      { id: "philosophy", label: L("Sub-label", "سطر سفلي"), type: "bi", def: L("Internal philosophy", "الفلسفة الداخلية") },
    ],
  },
  {
    slug: "home.clients",
    page: "home",
    label: L("Who we work with", "مع من نعمل"),
    media: true,
    defaultBg: { type: "video", url: "/vid2-a6-9.mp4", poster: "/posters/vid2.jpg" },
    fields: [
      { id: "label", label: L("Label", "التصنيف"), type: "bi", def: clients.label },
      { id: "heading", label: L("Heading", "العنوان"), type: "bi", def: clients.heading },
      { id: "body", label: L("Body", "النص"), type: "biLong", def: clients.body },
      { id: "sectors", label: L("Sectors (one per row)", "القطاعات (واحد لكل صف)"), type: "biList", def: clients.sectors },
    ],
  },
  {
    slug: "home.goal",
    page: "home",
    label: L("2030 goal", "هدف ٢٠٣٠"),
    media: true,
    defaultBg: { type: "video", url: "/final.mp4", poster: "/posters/final.jpg" },
    fields: [
      { id: "label", label: L("Label", "التصنيف"), type: "bi", def: goal.label },
      { id: "question", label: L("Question", "السؤال"), type: "bi", def: goal.question },
      { id: "answer", label: L("Answer", "الإجابة"), type: "bi", def: goal.answer },
    ],
  },
  {
    slug: "global.cta",
    page: "global",
    label: L("Call to action (all pages)", "الدعوة (كل الصفحات)"),
    media: true,
    defaultBg: { type: "image", url: "/posters/final2.jpg", poster: null },
    fields: [
      { id: "tag", label: L("Tag", "الوسم"), type: "bi", def: L("Let's talk", "لنبدأ") },
      { id: "heading", label: L("Heading", "العنوان"), type: "bi", def: cta.heading },
      { id: "body", label: L("Body", "النص"), type: "biLong", def: cta.body },
      { id: "button", label: L("Button", "الزر"), type: "bi", def: cta.button },
    ],
  },

  /* ── Studio ── */
  {
    slug: "studio.hero",
    page: "studio",
    label: L("Studio hero", "واجهة الاستوديو"),
    media: true,
    defaultBg: { type: "video", url: "/final.mp4", poster: "/posters/final.jpg" },
    fields: [
      { id: "eyebrow", label: L("Eyebrow", "سطر علوي"), type: "bi", def: artHouse.eyebrow },
      { id: "title", label: L("Title", "العنوان"), type: "bi", def: artHouse.title },
      { id: "subtitle", label: L("Subtitle", "العنوان الفرعي"), type: "biLong", def: artHouse.subtitle },
    ],
  },
  {
    slug: "studio.intro",
    page: "studio",
    label: L("Studio intro", "مقدمة الاستوديو"),
    media: true,
    defaultBg: { type: "image", url: "/posters/vid1.jpg", poster: null },
    fields: [{ id: "body", label: L("Statement", "النص"), type: "biLong", def: artHouse.body }],
  },
  {
    slug: "studio.offer",
    page: "studio",
    label: L("What the studio offers", "ماذا يقدّم الاستوديو"),
    media: true,
    defaultBg: { type: "image", url: "/posters/vid2.jpg", poster: null },
    fields: [
      { id: "heading", label: L("Heading", "العنوان"), type: "bi", def: artHouse.offer.heading },
      {
        id: "items",
        label: L("Offerings", "العروض"),
        type: "biObjList",
        def: objList(artHouse.offer.items, ["name", "body"]),
        itemFields: [
          { id: "name", label: L("Name", "الاسم") },
          { id: "body", label: L("Description", "الوصف"), long: true },
        ],
      },
    ],
  },
  {
    slug: "studio.equipment",
    page: "studio",
    label: L("Equipment", "المعدات"),
    media: true,
    defaultBg: { type: "image", url: "/posters/final2.jpg", poster: null },
    fields: [
      { id: "heading", label: L("Heading", "العنوان"), type: "bi", def: artHouse.equipment.heading },
      { id: "body", label: L("Sub-heading", "العنوان الفرعي"), type: "biLong", def: artHouse.equipment.body },
      {
        id: "items",
        label: L("Equipment list", "قائمة المعدات"),
        type: "biObjList",
        def: objList(artHouse.equipment.items, ["name", "body"]),
        itemFields: [
          { id: "name", label: L("Name", "الاسم") },
          { id: "body", label: L("Description", "الوصف"), long: true },
        ],
      },
    ],
  },

  /* ── Founder ── */
  {
    slug: "founder.hero",
    page: "founder",
    label: L("Founder hero", "واجهة المؤسس"),
    media: true,
    defaultBg: { type: "video", url: "/vid1-16-9.mp4", poster: "/posters/vid1.jpg" },
    fields: [
      { id: "role", label: L("Role", "المنصب"), type: "bi", def: founder.role },
      { id: "name", label: L("Name", "الاسم"), type: "bi", def: founder.name },
      { id: "bio", label: L("Bio", "النبذة"), type: "biLong", def: founder.bio },
      { id: "quote", label: L("Quote", "الاقتباس"), type: "biLong", def: founder.quote },
    ],
  },
  {
    slug: "founder.focus",
    page: "founder",
    label: L("Where he works", "أين يعمل"),
    media: true,
    defaultBg: { type: "image", url: "/posters/final.jpg", poster: null },
    fields: [
      { id: "heading", label: L("Heading", "العنوان"), type: "bi", def: founder.focus.heading },
      {
        id: "items",
        label: L("Focus areas", "مجالات العمل"),
        type: "biObjList",
        def: objList(founder.focus.items, ["title", "body"]),
        itemFields: [
          { id: "title", label: L("Title", "العنوان") },
          { id: "body", label: L("Description", "الوصف"), long: true },
        ],
      },
    ],
  },
];

export function sectionDef(slug: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

/* ── Pure merge helpers (safe on client and server) ── */

/** DB background if set, otherwise the code default passed in. */
export function contentBg(row: SectionRow | undefined, fallback: SectionBg): SectionBg {
  if (row?.bg_type) {
    return { type: row.bg_type, url: row.bg_url, poster: row.bg_poster_url };
  }
  return fallback;
}

/** A non-empty override for `id`, otherwise the fallback default. */
export function contentField<T>(row: SectionRow | undefined, id: string, fallback: T): T {
  const v = row?.content?.[id];
  if (v == null) return fallback;
  // Treat empty strings / empty bilingual values as "unset".
  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    const en = o.en;
    const ar = o.ar;
    const empty = (x: unknown) =>
      x == null ||
      (typeof x === "string" && x.trim() === "") ||
      (Array.isArray(x) && x.length === 0);
    if (empty(en) && empty(ar)) return fallback;
  }
  return v as T;
}
