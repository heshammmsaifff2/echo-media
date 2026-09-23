"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import type { Contact } from "@/lib/brand";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Check, MessageCircle } from "lucide-react";

const SOCIAL_ORDER = ["Facebook", "Instagram", "TikTok"] as const;

export function ContactEditor({ initial }: { initial: Contact }) {
  const { isAr } = useI18n();
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const router = useRouter();

  const [email, setEmail] = useState(initial.email ?? "");
  const [phones, setPhones] = useState(
    (initial.phones ?? []).map((p) => ({
      number: p.number,
      labelEn: p.label?.en ?? "",
      labelAr: p.label?.ar ?? "",
      whatsapp: !!p.whatsapp,
    }))
  );
  const [social, setSocial] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = { Facebook: "", Instagram: "", TikTok: "" };
    for (const s of initial.social ?? []) if (s.name in map) map[s.name] = s.url;
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addPhone = () => setPhones((p) => [...p, { number: "", labelEn: "", labelAr: "", whatsapp: true }]);
  const removePhone = (i: number) => setPhones((p) => p.filter((_, idx) => idx !== i));
  const setPhone = (i: number, patch: Partial<(typeof phones)[number]>) =>
    setPhones((p) => p.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const value = {
        ...initial,
        email: email.trim(),
        phones: phones
          .filter((p) => p.number.trim())
          .map((p) => ({ number: p.number.trim(), label: { en: p.labelEn, ar: p.labelAr }, whatsapp: p.whatsapp })),
        social: SOCIAL_ORDER.map((name) => ({ name, url: (social[name] || "").trim() })).filter((s) => s.url),
      };
      const supabase = createClient();
      const { error } = await supabase.from("site_settings").upsert({ key: "contact", value }, { onConflict: "key" });
      if (error) throw error;
      setSaved(true);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Failed to save", "فشل الحفظ"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("Contact details", "بيانات التواصل")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Email, phone numbers, WhatsApp and social links shown in the site footer.", "الإيميل وأرقام الهاتف والواتساب وروابط السوشيال التي تظهر في تذييل الموقع.")}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6 grid gap-2">
            <Label>{t("Email", "البريد الإلكتروني")}</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" placeholder="hello@example.com" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base">{t("Phone numbers", "أرقام الهاتف")}</Label>
              <Button size="sm" variant="outline" onClick={addPhone} className="gap-1.5 cursor-pointer"><Plus size={14} /> {t("Add number", "إضافة رقم")}</Button>
            </div>
            {phones.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No numbers yet.", "لا توجد أرقام.")}</p>
            ) : (
              <div className="grid gap-4">
                {phones.map((p, i) => (
                  <div key={i} className="rounded-lg border border-border/60 p-3 grid gap-3">
                    <div className="flex items-center gap-2">
                      <Input value={p.number} onChange={(e) => setPhone(i, { number: e.target.value })} dir="ltr" placeholder="+20 123 456 7890" className="flex-1" />
                      <Button variant="ghost" size="icon" className="text-destructive cursor-pointer" onClick={() => removePhone(i)}><Trash2 size={15} /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={p.labelEn} onChange={(e) => setPhone(i, { labelEn: e.target.value })} placeholder={t("Label (EN)", "الوصف (إنجليزي)")} />
                      <Input value={p.labelAr} onChange={(e) => setPhone(i, { labelAr: e.target.value })} dir="rtl" placeholder={t("Label (AR)", "الوصف (عربي)")} />
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={p.whatsapp} onChange={(e) => setPhone(i, { whatsapp: e.target.checked })} className="rounded" />
                      <MessageCircle size={15} className="text-[hsl(var(--echo-accent))]" />
                      {t("Show WhatsApp link", "إظهار رابط واتساب")}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 grid gap-4">
            <Label className="text-base">{t("Social links", "روابط السوشيال")}</Label>
            {SOCIAL_ORDER.map((name) => (
              <div key={name} className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">{name}</Label>
                <Input value={social[name] || ""} onChange={(e) => setSocial((s) => ({ ...s, [name]: e.target.value }))} dir="ltr" placeholder={`https://${name.toLowerCase()}.com/...`} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">{t("Leave a link empty to hide that platform.", "اترك الرابط فارغاً لإخفاء المنصة.")}</p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="cursor-pointer">
            {saving ? <><Loader2 size={16} className="animate-spin mr-2" /> {t("Saving…", "جارٍ الحفظ…")}</> : t("Save changes", "حفظ التغييرات")}
          </Button>
          {saved && <span className="inline-flex items-center gap-1.5 text-sm text-green-500"><Check size={15} /> {t("Saved", "تم الحفظ")}</span>}
        </div>
      </div>
    </div>
  );
}
