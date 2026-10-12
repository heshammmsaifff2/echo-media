"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/upload";
import { useI18n } from "@/lib/i18n";
import { SECTIONS, type SectionDef, type SectionRow, type FieldDef } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Plus, Trash2, Loader2, ImageIcon, Film, Type } from "lucide-react";

type BiVal = { en: string; ar: string };
type ListVal = { en: string[]; ar: string[] };
type ObjListVal = { en: Record<string, string>[]; ar: Record<string, string>[] };
type MediaVal = string; // a single uploaded image/video URL
type FieldVal = BiVal | ListVal | ObjListVal | MediaVal;

type Bg = {
  type: "image" | "video" | "none";
  url: string;
  poster: string;
  publicId: string;
};

const PAGE_LABEL: Record<string, { en: string; ar: string }> = {
  home: { en: "Home", ar: "الرئيسية" },
  studio: { en: "Studio", ar: "الاستوديو" },
  founder: { en: "Founder", ar: "المؤسس" },
  global: { en: "Global", ar: "عام" },
};

function cloneDefault(f: FieldDef): FieldVal {
  if (f.type === "media") {
    return (typeof f.def === "string" ? f.def : "") as MediaVal;
  }
  const d = f.def as Record<string, unknown>;
  if (f.type === "biList") {
    return { en: [...((d.en as string[]) ?? [])], ar: [...((d.ar as string[]) ?? [])] };
  }
  if (f.type === "biObjList") {
    return {
      en: ((d.en as Record<string, string>[]) ?? []).map((r) => ({ ...r })),
      ar: ((d.ar as Record<string, string>[]) ?? []).map((r) => ({ ...r })),
    };
  }
  return { en: (d.en as string) ?? "", ar: (d.ar as string) ?? "" };
}

function initFields(def: SectionDef, row?: SectionRow): Record<string, FieldVal> {
  const out: Record<string, FieldVal> = {};
  for (const f of def.fields) {
    const cur = row?.content?.[f.id];
    out[f.id] = cur != null ? (JSON.parse(JSON.stringify(cur)) as FieldVal) : cloneDefault(f);
  }
  return out;
}

function initBg(row?: SectionRow, def?: SectionDef): Bg {
  const allowed = def?.mediaTypes ?? (["image", "video", "none"] as const);
  let rawType = (row?.bg_type as Bg["type"]) ?? def?.defaultBg.type ?? "none";
  if (!allowed.includes(rawType as "image" | "video" | "none")) {
    rawType = (allowed[0] as Bg["type"]) ?? "image";
  }

  // If this section has a row stored in DB:
  if (row) {
    if (rawType === "none") {
      return {
        type: "none",
        url: "",
        poster: "",
        publicId: "",
      };
    }
    return {
      type: rawType,
      url: row.bg_url ?? "",
      poster: row.bg_poster_url ?? "",
      publicId: row.bg_public_id ?? "",
    };
  }

  // If no DB row exists yet:
  return {
    type: rawType,
    url: rawType === "none" ? "" : (def?.defaultBg.url ?? ""),
    poster: rawType === "none" ? "" : (def?.defaultBg.poster ?? ""),
    publicId: "",
  };
}

export function ContentManager({ initialRows, editingSlug }: { initialRows: Record<string, SectionRow>; editingSlug?: string }) {
  const router = useRouter();
  const { isAr } = useI18n();
  const t = (en: string, ar: string) => (isAr ? ar : en);

  const [rows, setRows] = useState(initialRows);
  const editing = SECTIONS.find((section) => section.slug === editingSlug) ?? null;
  const [fields, setFields] = useState<Record<string, FieldVal>>(() => editing ? initFields(editing, initialRows[editing.slug]) : {});
  const [bg, setBg] = useState<Bg>(() => initBg(editing ? initialRows[editing.slug] : undefined, editing ?? undefined));
  const [muted, setMuted] = useState<boolean>(() => {
    const raw = editing ? initialRows[editing.slug]?.content?.muted : undefined;
    return raw !== undefined ? Boolean(raw) : true;
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"media" | "poster" | null>(null);

  const setField = (id: string, val: FieldVal) => setFields((f) => ({ ...f, [id]: val }));

  const handleUpload = async (file: File, kind: "media" | "poster") => {
    setUploading(kind);
    try {
      const { url, publicId } = await uploadToCloudinary(file, "echo/backgrounds");
      if (kind === "media") {
        setBg((b) => ({ ...b, url, publicId }));
      } else {
        setBg((b) => ({ ...b, poster: url }));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Upload failed", "فشل الرفع"));
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      // Clean list/obj-list values so blank rows don't persist.
      const content: Record<string, unknown> = {};
      for (const f of editing.fields) {
        const v = fields[f.id];
        if (f.type === "biList") {
          const lv = v as ListVal;
          content[f.id] = {
            en: (lv.en ?? []).map((s) => s.trim()).filter(Boolean),
            ar: (lv.ar ?? []).map((s) => s.trim()).filter(Boolean),
          };
        } else if (f.type === "biObjList") {
          const ov = v as ObjListVal;
          const keep = (r: Record<string, string>) =>
            Object.values(r).some((x) => (x ?? "").trim() !== "");
          content[f.id] = {
            en: (ov.en ?? []).filter(keep),
            ar: (ov.ar ?? []).filter(keep),
          };
        } else {
          content[f.id] = v;
        }
      }

      if (bg.type === "video" || editing.slug === "home.spotlight") {
        content["muted"] = muted;
      }

      const payload = {
        slug: editing.slug,
        content,
        bg_type: bg.type,
        bg_url: bg.type === "none" ? null : (bg.url?.trim() || null),
        bg_poster_url: (bg.type === "video" && bg.poster?.trim()) ? bg.poster.trim() : null,
        bg_public_id: bg.type === "none" ? null : (bg.publicId || null),
      };

      const supabase = createClient();
      const { error } = await supabase
        .from("section_content")
        .upsert(payload, { onConflict: "slug" });
      if (error) throw error;

      setRows((r) => ({ ...r, [editing.slug]: payload as unknown as SectionRow }));
      router.push("/admin/content");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Save failed", "فشل الحفظ"));
    } finally {
      setSaving(false);
    }
  };

  const pages = ["home", "studio", "founder", "global"] as const;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {!editing && <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("Site Content", "محتوى الموقع")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t(
            "Edit the text and background image/video of every section. Empty fields fall back to the built-in defaults.",
            "عدّل نص وخلفية كل قسم (صورة أو فيديو). الحقول الفارغة ترجع للقيم الافتراضية."
          )}
        </p>
      </div>

      {pages.map((page) => {
        const items = SECTIONS.filter((s) => s.page === page);
        if (!items.length) return null;
        return (
          <div key={page} className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {isAr ? PAGE_LABEL[page].ar : PAGE_LABEL[page].en}
            </h2>
            <div className="grid gap-3">
              {items.map((def) => {
                const row = rows[def.slug];
                const allowed = def.mediaTypes ?? (["image", "video", "none"] as const);
                let type = (row?.bg_type as string) ?? def.defaultBg.type;
                if (!allowed.includes(type as "image" | "video" | "none")) {
                  type = allowed[0] ?? "image";
                }

                let url = "";
                let poster = "";
                if (type !== "none") {
                  url = row ? (row.bg_url ?? "") : (def.defaultBg.url ?? "");
                  poster = row ? (row.bg_poster_url ?? "") : (def.defaultBg.poster ?? "");
                }
                const preview = type === "none" ? null : (type === "video" ? poster || null : url || null);
                return (
                  <Card key={def.slug}>
                    <CardContent className="flex items-center gap-4 py-3">
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative grid place-items-center">
                        {!def.media ? (
                          <Type size={18} className="text-muted-foreground" />
                        ) : preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                        ) : type === "video" ? (
                          <Film size={18} className="text-muted-foreground" />
                        ) : (
                          <ImageIcon size={18} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {isAr ? def.label.ar : def.label.en}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {!def.media
                            ? t("Text only — no media", "نص فقط — بدون وسائط")
                            : type === "none" || !url
                            ? t("None — no background media", "بدون — لا توجد وسائط")
                            : `${type} · ${url}`}
                        </p>
                      </div>
                      <Button variant="outline" asChild className="gap-2">
                        <Link href={`/admin/content/${def.slug}`}><Pencil size={16} />{t("Edit", "تعديل")}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      </>}
      {editing && <section className="content-editor">
        <div className="sticky top-0 z-20 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-background/95 p-4 backdrop-blur">
          <div>
            <Link href="/admin/content" className="text-sm text-primary hover:underline">{t("Back to content", "العودة للمحتوى")}</Link>
            <h1 className="mt-2 text-2xl font-bold">{isAr ? editing.label.ar : editing.label.en}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving || uploading !== null}>
            {saving && <Loader2 size={16} className="me-2 animate-spin" />}{t("Save changes", "حفظ التعديلات")}
          </Button>
        </div>
          {editing && (
            <div className="grid gap-8 py-2">
              {/* Background media — only for sections that render one. */}
              {editing.media && (
                <div className="grid gap-3 rounded-xl border border-border/60 p-6">
                <Label className="text-sm font-semibold">
                  {editing.slug === "founder.hero"
                    ? t("Founder Profile Photo", "صورة بروفايل المؤسس")
                    : editing.slug === "home.spotlight"
                    ? t("Featured Media (Video / Image)", "وسائط العرض المميز (فيديو / صورة)")
                    : editing.slug === "home.dna"
                    ? t("DNA Card Media (Optional Video / Image)", "وسائط بطاقة DNA (فيديو أو صورة اختياري)")
                    : t("Background", "الخلفية")}
                </Label>
                
                {/* Media type selector — only show buttons if more than one type is allowed */}
                {((editing.mediaTypes ?? (["image", "video", "none"] as const)).length > 1) ? (
                  <div className="flex gap-2">
                    {(editing.mediaTypes ?? (["image", "video", "none"] as const)).map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => {
                          if (tp === "none" && (bg.url || bg.poster)) {
                            const confirmed = window.confirm(
                              isAr
                                ? "اختيار (بدون) سيقوم بإزالة الفيديو/الصورة الحالية. هل أنت متأكد من المتابعة؟"
                                : "Selecting (None) will remove the current media. Are you sure you want to proceed?"
                            );
                            if (!confirmed) return;
                          }
                          setBg((b) => ({
                            ...b,
                            type: tp,
                            ...(tp === "none" ? { url: "", poster: "", publicId: "" } : {}),
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                          bg.type === tp
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tp === "image" ? t("Image", "صورة") : tp === "video" ? t("Video", "فيديو") : t("None", "بدون")}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    <span>{t("Image only", "صورة فقط")}</span>
                  </div>
                )}

                {bg.type === "none" && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-border/80 p-4 text-xs text-muted-foreground bg-muted/20">
                    <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/60" />
                    <span>
                      {t(
                        "No background media selected — this section will display without video or image.",
                        "تم اختيار (بدون) — سيعمل هذا القسم بدون أي فيديو أو صورة."
                      )}
                    </span>
                  </div>
                )}

                {bg.type !== "none" && (
                  <>
                    {bg.url && (
                      <div className="grid gap-2 rounded-lg border border-border/70 p-3 bg-muted/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {bg.type === "video"
                              ? t("Current video preview", "معاينة الفيديو الحالي")
                              : t("Current image preview", "معاينة الصورة الحالية")}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const confirmed = window.confirm(
                                isAr
                                  ? `هل أنت متأكد من حذف ${bg.type === "video" ? "الفيديو" : "الصورة"}؟`
                                  : `Are you sure you want to delete this ${bg.type === "video" ? "video" : "image"}?`
                              );
                              if (confirmed) {
                                setBg((b) => ({ ...b, url: "", publicId: "" }));
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline cursor-pointer"
                          >
                            <Trash2 size={13} />
                            {bg.type === "video" ? t("Delete video", "حذف الفيديو") : t("Delete image", "حذف الصورة")}
                          </button>
                        </div>
                        {bg.type === "video" ? (
                          <video src={bg.url} className="max-h-40 rounded-md" muted controls />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bg.url} alt="" className="max-h-48 rounded-md object-contain" />
                        )}
                      </div>
                    )}

                    <div className="grid gap-1.5">
                      <Label className="text-xs">
                        {editing.slug === "founder.hero"
                          ? t("Upload profile photo", "رفع صورة البروفايل")
                          : `${t("Upload new", "رفع ملف جديد")} (${bg.type === "video" ? "video" : "image"})`}
                      </Label>
                      <Input
                        type="file"
                        accept={bg.type === "video" ? "video/*" : "image/*"}
                        disabled={uploading !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f, "media");
                        }}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">{t("Or paste a URL", "أو الصق رابط")}</Label>
                      <Input
                        value={bg.url}
                        dir="ltr"
                        onChange={(e) => setBg((b) => ({ ...b, url: e.target.value }))}
                        placeholder={editing.slug === "founder.hero" ? "https://res.cloudinary.com/.../photo.jpg" : "/final.mp4 or https://…"}
                      />
                    </div>

                    {bg.type === "video" && (
                      <>
                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">{t("Poster image (optional)", "صورة الغلاف (اختياري)")}</Label>
                            {bg.poster && (
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    isAr
                                      ? "هل أنت متأكد من حذف صورة الغلاف؟"
                                      : "Are you sure you want to delete this poster image?"
                                  );
                                  if (confirmed) {
                                    setBg((b) => ({ ...b, poster: "" }));
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline cursor-pointer"
                              >
                                <Trash2 size={12} />
                                {t("Delete poster", "حذف صورة الغلاف")}
                              </button>
                            )}
                          </div>
                          {bg.poster && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={bg.poster} alt="" className="max-h-24 rounded-md object-contain" />
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            disabled={uploading !== null}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUpload(f, "poster");
                            }}
                          />
                        </div>

                        <div className="grid gap-2 rounded-lg border border-border/70 bg-card p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <Label className="text-xs font-semibold">
                                {t("Video Sound Mode", "وضع صوت الفيديو")}
                              </Label>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {t(
                                  "If Silent, audio is completely locked off and visitors cannot enable sound. If With Sound, audio is enabled with player controls.",
                                  "إذا تم اختياره (صامت)، سيعمل الفيديو بدون صوت نهائياً ولن يتمكن الزوار من تشغيله. أما (بصوت) فيتيح الصوت مع زر التحكم للزوار."
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setMuted(true)}
                                className={`px-3.5 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                                  muted
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "border-border text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {t("Silent (Locked)", "صامت (مغلق نهائياً)")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setMuted(false)}
                                className={`px-3.5 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                                  !muted
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "border-border text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {t("With Sound (Enabled)", "بصوت (متاح للزوار)")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {uploading && (
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 size={13} className="animate-spin" />
                        {t("Uploading…", "جاري الرفع…")}
                      </p>
                    )}
                  </>
                )}
                </div>
              )}

              {/* Text fields */}
              {editing.fields.map((f) => (
                <FieldEditor
                  key={f.id}
                  field={f}
                  value={fields[f.id]}
                  onChange={(v) => setField(f.id, v)}
                  t={t}
                />
              ))}

              <Button onClick={handleSave} disabled={saving || uploading !== null} className="cursor-pointer">
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> {t("Saving…", "جاري الحفظ…")}
                  </>
                ) : (
                  t("Save", "حفظ")
                )}
              </Button>
            </div>
          )}
      </section>}
    </div>
  );
}

function TextField({
  long,
  value,
  onChange,
  dir,
  placeholder,
}: {
  long?: boolean;
  value: string;
  onChange: (s: string) => void;
  dir?: "rtl";
  placeholder?: string;
}) {
  if (long) {
    return (
      <Textarea
        rows={7}
        value={value}
        dir={dir}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <Input
      value={value}
      dir={dir}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function MediaFieldEditor({
  label,
  value,
  onChange,
  t,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  t: (en: string, ar: string) => string;
}) {
  const [uploading, setUploading] = useState(false);
  const isVideo = /\.(mp4|mov|webm|m4v|avi|mkv)(\?|$)/i.test(value) || value.includes("/video/upload/");

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, "echo/site");
      onChange(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Upload failed", "فشل الرفع"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {value && (
          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                t("Are you sure you want to delete this media file?", "هل أنت متأكد من حذف هذا الملف؟")
              );
              if (confirmed) onChange("");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline cursor-pointer"
          >
            <Trash2 size={13} />
            {t("Delete media", "حذف الملف")}
          </button>
        )}
      </div>
      {value &&
        (isVideo ? (
          <video src={value} className="max-h-40 rounded-md" muted controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="max-h-40 rounded-md object-contain" />
        ))}
      <Input
        type="file"
        accept="video/*,image/*"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      <Input
        value={value}
        dir="ltr"
        placeholder="https://…"
        onChange={(e) => onChange(e.target.value)}
      />
      {uploading && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 size={13} className="animate-spin" /> {t("Uploading…", "جاري الرفع…")}
        </p>
      )}
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
  t,
}: {
  field: FieldDef;
  value: FieldVal;
  onChange: (v: FieldVal) => void;
  t: (en: string, ar: string) => string;
}) {
  const label = t(field.label.en, field.label.ar);

  if (field.type === "media") {
    return <MediaFieldEditor label={label} value={(value as string) || ""} onChange={(s) => onChange(s)} t={t} />;
  }

  if (field.type === "bi" || field.type === "biLong") {
    const v = value as BiVal;
    const long = field.type === "biLong";
    return (
      <div className="grid gap-4 rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6">
        <Label className="text-base font-semibold">{label}</Label>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TextField long={long} value={v.en} placeholder="English" onChange={(s) => onChange({ ...v, en: s })} />
          <TextField long={long} value={v.ar} dir="rtl" placeholder="العربية" onChange={(s) => onChange({ ...v, ar: s })} />
        </div>
      </div>
    );
  }

  if (field.type === "biList") {
    const v = value as ListVal;
    return (
      <div className="grid gap-4 rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6">
        <Label className="text-base font-semibold">{label}</Label>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Textarea
            rows={8}
            value={(v.en ?? []).join("\n")}
            onChange={(e) => onChange({ ...v, en: e.target.value.split("\n") })}
            placeholder={"One per line"}
          />
          <Textarea
            rows={8}
            dir="rtl"
            value={(v.ar ?? []).join("\n")}
            onChange={(e) => onChange({ ...v, ar: e.target.value.split("\n") })}
            placeholder={"سطر لكل عنصر"}
          />
        </div>
      </div>
    );
  }

  // biObjList
  const v = value as ObjListVal;
  const rowCount = Math.max(v.en?.length ?? 0, v.ar?.length ?? 0);
  const subs = field.itemFields ?? [];

  const setCell = (lang: "en" | "ar", i: number, key: string, val: string) => {
    const arr = [...(v[lang] ?? [])];
    while (arr.length <= i) arr.push({});
    arr[i] = { ...arr[i], [key]: val };
    onChange({ ...v, [lang]: arr });
  };
  const addRow = () => onChange({ en: [...(v.en ?? []), {}], ar: [...(v.ar ?? []), {}] });
  const removeRow = (i: number) => {
    const confirmed = window.confirm(
      t("Are you sure you want to delete this row?", "هل أنت متأكد من حذف هذا العنصر؟")
    );
    if (!confirmed) return;
    onChange({
      en: (v.en ?? []).filter((_, idx) => idx !== i),
      ar: (v.ar ?? []).filter((_, idx) => idx !== i),
    });
  };

  return (
    <div className="grid gap-3">
      <Label className="text-sm font-medium">{label}</Label>
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-border/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">#{i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => removeRow(i)} className="h-7 w-7 text-destructive cursor-pointer">
              <Trash2 size={14} />
            </Button>
          </div>
          {subs.map((sf) => (
            <div key={sf.id} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <TextField
                long={sf.long}
                value={v.en?.[i]?.[sf.id] ?? ""}
                placeholder={`${sf.label.en} (EN)`}
                onChange={(s) => setCell("en", i, sf.id, s)}
              />
              <TextField
                long={sf.long}
                value={v.ar?.[i]?.[sf.id] ?? ""}
                dir="rtl"
                placeholder={`${sf.label.ar} (AR)`}
                onChange={(s) => setCell("ar", i, sf.id, s)}
              />
            </div>
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow} className="w-fit gap-2 cursor-pointer">
        <Plus size={14} /> {t("Add row", "إضافة صف")}
      </Button>
    </div>
  );
}
