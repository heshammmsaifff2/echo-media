"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/upload";
import { useI18n } from "@/lib/i18n";
import { SECTIONS, type SectionDef, type SectionRow, type FieldDef } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Plus, Trash2, Loader2, ImageIcon, Film } from "lucide-react";

type BiVal = { en: string; ar: string };
type ListVal = { en: string[]; ar: string[] };
type ObjListVal = { en: Record<string, string>[]; ar: Record<string, string>[] };
type FieldVal = BiVal | ListVal | ObjListVal;

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

function initBg(row?: SectionRow): Bg {
  return {
    type: (row?.bg_type as Bg["type"]) ?? "none",
    url: row?.bg_url ?? "",
    poster: row?.bg_poster_url ?? "",
    publicId: row?.bg_public_id ?? "",
  };
}

export function ContentManager({ initialRows }: { initialRows: Record<string, SectionRow> }) {
  const { isAr } = useI18n();
  const t = (en: string, ar: string) => (isAr ? ar : en);

  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<SectionDef | null>(null);
  const [fields, setFields] = useState<Record<string, FieldVal>>({});
  const [bg, setBg] = useState<Bg>(initBg());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"media" | "poster" | null>(null);

  const openEdit = (def: SectionDef) => {
    const row = rows[def.slug];
    setEditing(def);
    setFields(initFields(def, row));
    setBg(initBg(row));
  };

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

      const payload = {
        slug: editing.slug,
        content,
        bg_type: bg.type,
        bg_url: bg.type === "none" ? null : bg.url || null,
        bg_poster_url: bg.type === "video" ? bg.poster || null : null,
        bg_public_id: bg.publicId || null,
      };

      const supabase = createClient();
      const { error } = await supabase
        .from("section_content")
        .upsert(payload, { onConflict: "slug" });
      if (error) throw error;

      setRows((r) => ({ ...r, [editing.slug]: payload as unknown as SectionRow }));
      setEditing(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Save failed", "فشل الحفظ"));
    } finally {
      setSaving(false);
    }
  };

  const pages = ["home", "studio", "founder", "global"] as const;

  return (
    <div>
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
                const type = (row?.bg_type as string) ?? def.defaultBg.type;
                const url = row?.bg_url ?? def.defaultBg.url;
                const poster = row?.bg_poster_url ?? def.defaultBg.poster;
                const preview = type === "video" ? poster || null : url;
                return (
                  <Card key={def.slug}>
                    <CardContent className="flex items-center gap-4 py-3">
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative grid place-items-center">
                        {preview ? (
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
                          {type} · {url || t("no media", "بدون وسائط")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(def)} className="cursor-pointer">
                        <Pencil size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? (isAr ? editing.label.ar : editing.label.en) : ""}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="grid gap-6 py-2">
              {/* Background media */}
              <div className="grid gap-3 rounded-lg border border-border/60 p-4">
                <Label className="text-sm font-semibold">
                  {t("Background", "الخلفية")}
                </Label>
                <div className="flex gap-2">
                  {(["image", "video", "none"] as const).map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => setBg((b) => ({ ...b, type: tp }))}
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

                {bg.type !== "none" && (
                  <>
                    {bg.url &&
                      (bg.type === "video" ? (
                        <video src={bg.url} className="max-h-40 rounded-md" muted controls />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bg.url} alt="" className="max-h-40 rounded-md object-contain" />
                      ))}

                    <div className="grid gap-1.5">
                      <Label className="text-xs">
                        {t("Upload new", "رفع ملف جديد")} ({bg.type === "video" ? "video" : "image"})
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
                        placeholder="/final.mp4 or https://…"
                      />
                    </div>

                    {bg.type === "video" && (
                      <div className="grid gap-1.5">
                        <Label className="text-xs">{t("Poster image (optional)", "صورة الغلاف (اختياري)")}</Label>
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
        </DialogContent>
      </Dialog>
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
        rows={3}
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

  if (field.type === "bi" || field.type === "biLong") {
    const v = value as BiVal;
    const long = field.type === "biLong";
    return (
      <div className="grid gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="grid grid-cols-2 gap-3">
          <TextField long={long} value={v.en} placeholder="English" onChange={(s) => onChange({ ...v, en: s })} />
          <TextField long={long} value={v.ar} dir="rtl" placeholder="العربية" onChange={(s) => onChange({ ...v, ar: s })} />
        </div>
      </div>
    );
  }

  if (field.type === "biList") {
    const v = value as ListVal;
    return (
      <div className="grid gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="grid grid-cols-2 gap-3">
          <Textarea
            rows={5}
            value={(v.en ?? []).join("\n")}
            onChange={(e) => onChange({ ...v, en: e.target.value.split("\n") })}
            placeholder={"One per line"}
          />
          <Textarea
            rows={5}
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
  const removeRow = (i: number) =>
    onChange({
      en: (v.en ?? []).filter((_, idx) => idx !== i),
      ar: (v.ar ?? []).filter((_, idx) => idx !== i),
    });

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
            <div key={sf.id} className="grid grid-cols-2 gap-2">
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
