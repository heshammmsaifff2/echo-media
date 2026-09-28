"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Loader2, FolderPlus } from "lucide-react";

export type Category = { id: string; name_en: string; name_ar: string; order_index: number };
export type Subcategory = { id: string; category_id: string; name_en: string; name_ar: string; order_index: number };

export function CategoriesManager({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const { isAr } = useI18n();
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const router = useRouter();

  const [catDialog, setCatDialog] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name_en: "", name_ar: "" });
  const [subInput, setSubInput] = useState<Record<string, { en: string; ar: string }>>({});
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setCatForm({ name_en: "", name_ar: "" });
    setCatDialog(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setCatForm({ name_en: c.name_en, name_ar: c.name_ar });
    setCatDialog(true);
  };

  const saveCategory = async () => {
    if (!catForm.name_en.trim() && !catForm.name_ar.trim()) return;
    setLoading(true);
    try {
      const supabase = createClient();
      if (editing) {
        await supabase.from("portfolio_categories").update({ name_en: catForm.name_en.trim(), name_ar: catForm.name_ar.trim() }).eq("id", editing.id);
      } else {
        await supabase.from("portfolio_categories").insert({ name_en: catForm.name_en.trim(), name_ar: catForm.name_ar.trim(), order_index: categories.length + 1 });
      }
      setCatDialog(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Failed", "فشل"));
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (c: Category) => {
    if (!confirm(t("Delete this category and its subcategories? Items keep their media but lose this category.", "حذف هذا التصنيف وفروعه؟ الأعمال هتفضل بس تفقد التصنيف ده."))) return;
    const supabase = createClient();
    await supabase.from("portfolio_categories").delete().eq("id", c.id);
    router.refresh();
  };

  const addSubcategory = async (catId: string) => {
    const val = subInput[catId] || { en: "", ar: "" };
    if (!val.en.trim() && !val.ar.trim()) return;
    const supabase = createClient();
    const count = subcategories.filter((s) => s.category_id === catId).length;
    await supabase.from("portfolio_subcategories").insert({ category_id: catId, name_en: val.en.trim(), name_ar: val.ar.trim(), order_index: count + 1 });
    setSubInput((p) => ({ ...p, [catId]: { en: "", ar: "" } }));
    router.refresh();
  };

  const deleteSubcategory = async (id: string) => {
    const supabase = createClient();
    await supabase.from("portfolio_subcategories").delete().eq("id", id);
    router.refresh();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{t("Categories", "التصنيفات")}</h2>
        <Dialog open={catDialog} onOpenChange={setCatDialog}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate} className="gap-2 cursor-pointer"><Plus size={15} /> {t("Add category", "إضافة تصنيف")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? t("Edit category", "تعديل التصنيف") : t("Add category", "إضافة تصنيف")}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>{t("Name (English)", "الاسم (إنجليزي)")}</Label>
                  <Input value={catForm.name_en} onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("Name (Arabic)", "الاسم (عربي)")}</Label>
                  <Input value={catForm.name_ar} onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })} dir="rtl" />
                </div>
              </div>
              <Button onClick={saveCategory} disabled={loading} className="cursor-pointer">
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}{t("Save", "حفظ")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">{t("No categories yet.", "لا توجد تصنيفات بعد.")}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {categories.map((c) => {
            const subs = subcategories.filter((s) => s.category_id === c.id);
            const val = subInput[c.id] || { en: "", ar: "" };
            return (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{isAr ? c.name_ar || c.name_en : c.name_en || c.name_ar}</p>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="h-8 w-8 cursor-pointer"><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCategory(c)} className="h-8 w-8 text-destructive cursor-pointer"><Trash2 size={14} /></Button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {subs.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
                        {isAr ? s.name_ar || s.name_en : s.name_en || s.name_ar}
                        <button type="button" onClick={() => deleteSubcategory(s.id)} className="text-muted-foreground hover:text-destructive cursor-pointer" title={t("Remove", "حذف")}>
                          <Trash2 size={11} />
                        </button>
                      </span>
                    ))}
                    {subs.length === 0 && <span className="text-xs text-muted-foreground italic">{t("No subcategories", "لا توجد فروع")}</span>}
                  </div>

                  {/* Add subcategory */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <FolderPlus size={14} className="text-muted-foreground" />
                    <Input value={val.en} onChange={(e) => setSubInput((p) => ({ ...p, [c.id]: { ...val, en: e.target.value } }))} placeholder={t("Subcategory (EN)", "فرع (إنجليزي)")} className="h-8 w-40" />
                    <Input value={val.ar} onChange={(e) => setSubInput((p) => ({ ...p, [c.id]: { ...val, ar: e.target.value } }))} placeholder={t("فرع (عربي)", "فرع (عربي)")} dir="rtl" className="h-8 w-40" />
                    <Button size="sm" variant="outline" onClick={() => addSubcategory(c.id)} className="h-8 gap-1.5 cursor-pointer"><Plus size={13} /> {t("Add", "إضافة")}</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
