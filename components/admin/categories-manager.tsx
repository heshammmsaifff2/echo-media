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

  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [subDialog, setSubDialog] = useState(false);
  const [subForm, setSubForm] = useState({ name_en: "", name_ar: "" });

  const [subInput, setSubInput] = useState<Record<string, { en: string; ar: string }>>({});
  const [loading, setLoading] = useState(false);
  const [loadingSub, setLoadingSub] = useState<Record<string, boolean>>({});

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

  const openEditSub = (s: Subcategory) => {
    setEditingSub(s);
    setSubForm({ name_en: s.name_en, name_ar: s.name_ar });
    setSubDialog(true);
  };

  const saveCategory = async () => {
    const en = catForm.name_en.trim();
    const ar = catForm.name_ar.trim();
    if (!en && !ar) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        name_en: en || ar,
        name_ar: ar || en,
      };

      if (editing) {
        const { error } = await supabase
          .from("portfolio_categories")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("portfolio_categories")
          .insert({ ...payload, order_index: categories.length + 1 });
        if (error) throw error;
      }
      setCatDialog(false);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : t("Failed to save category", "فشل حفظ التصنيف"));
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (c: Category) => {
    if (!confirm(t("Delete this category and its subcategories? Items keep their media but lose this category.", "حذف هذا التصنيف وفروعه؟ الأعمال هتفضل بس تفقد التصنيف ده."))) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("portfolio_categories").delete().eq("id", c.id);
      if (error) throw error;
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : t("Failed to delete category", "فشل حذف التصنيف"));
    }
  };

  const addSubcategory = async (catId: string) => {
    const current = subInput[catId] || { en: "", ar: "" };
    const en = current.en.trim();
    const ar = current.ar.trim();
    if (!en && !ar) return;

    setLoadingSub((prev) => ({ ...prev, [catId]: true }));
    try {
      const supabase = createClient();
      const count = subcategories.filter((s) => s.category_id === catId).length;
      const { error } = await supabase.from("portfolio_subcategories").insert({
        category_id: catId,
        name_en: en || ar,
        name_ar: ar || en,
        order_index: count + 1,
      });

      if (error) throw error;

      setSubInput((p) => ({ ...p, [catId]: { en: "", ar: "" } }));
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : t("Failed to add subcategory", "فشل إضافة الفرع"));
    } finally {
      setLoadingSub((prev) => ({ ...prev, [catId]: false }));
    }
  };

  const saveSubcategory = async () => {
    if (!editingSub) return;
    const en = subForm.name_en.trim();
    const ar = subForm.name_ar.trim();
    if (!en && !ar) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("portfolio_subcategories")
        .update({
          name_en: en || ar,
          name_ar: ar || en,
        })
        .eq("id", editingSub.id);

      if (error) throw error;
      setSubDialog(false);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : t("Failed to update subcategory", "فشل تعديل الفرع"));
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = async (id: string) => {
    if (!confirm(t("Delete this subcategory?", "حذف هذا الفرع؟"))) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("portfolio_subcategories").delete().eq("id", id);
      if (error) throw error;
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : t("Failed to delete subcategory", "فشل حذف الفرع"));
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{t("Categories & Subcategories", "التصنيفات والفروع")}</h2>
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

      {/* Edit Subcategory Dialog */}
      <Dialog open={subDialog} onOpenChange={setSubDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("Edit Subcategory", "تعديل الفرع")}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{t("Name (English)", "الاسم (إنجليزي)")}</Label>
                <Input value={subForm.name_en} onChange={(e) => setSubForm({ ...subForm, name_en: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{t("Name (Arabic)", "الاسم (عربي)")}</Label>
                <Input value={subForm.name_ar} onChange={(e) => setSubForm({ ...subForm, name_ar: e.target.value })} dir="rtl" />
              </div>
            </div>
            <Button onClick={saveSubcategory} disabled={loading} className="cursor-pointer">
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}{t("Save", "حفظ")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {categories.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">{t("No categories yet.", "لا توجد تصنيفات بعد.")}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {categories.map((c) => {
            const subs = subcategories.filter((s) => s.category_id === c.id);
            const val = subInput[c.id] || { en: "", ar: "" };
            const isSubmitting = !!loadingSub[c.id];

            return (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-base">{isAr ? c.name_ar || c.name_en : c.name_en || c.name_ar}</p>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="h-8 w-8 cursor-pointer" title={t("Edit", "تعديل")}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCategory(c)} className="h-8 w-8 text-destructive cursor-pointer" title={t("Delete", "حذف")}><Trash2 size={14} /></Button>
                    </div>
                  </div>

                  {/* Subcategories list */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">{t("Subcategories:", "الفروع:")}</span>
                    {subs.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
                        <span>{isAr ? s.name_ar || s.name_en : s.name_en || s.name_ar}</span>
                        <button
                          type="button"
                          onClick={() => openEditSub(s)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          title={t("Edit", "تعديل")}
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubcategory(s.id)}
                          className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                          title={t("Remove", "حذف")}
                        >
                          <Trash2 size={11} />
                        </button>
                      </span>
                    ))}
                    {subs.length === 0 && <span className="text-xs text-muted-foreground italic">{t("No subcategories", "لا توجد فروع")}</span>}
                  </div>

                  {/* Add subcategory */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <FolderPlus size={14} className="text-muted-foreground" />
                    <Input
                      value={val.en}
                      onChange={(e) => {
                        const valText = e.target.value;
                        setSubInput((p) => ({
                          ...p,
                          [c.id]: { en: valText, ar: p[c.id]?.ar || "" },
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubcategory(c.id);
                        }
                      }}
                      placeholder={t("Subcategory (EN)", "فرع (إنجليزي)")}
                      className="h-8 w-36 sm:w-44 text-xs"
                      disabled={isSubmitting}
                    />
                    <Input
                      value={val.ar}
                      onChange={(e) => {
                        const valText = e.target.value;
                        setSubInput((p) => ({
                          ...p,
                          [c.id]: { en: p[c.id]?.en || "", ar: valText },
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubcategory(c.id);
                        }
                      }}
                      placeholder={t("فرع (عربي)", "فرع (عربي)")}
                      dir="rtl"
                      className="h-8 w-36 sm:w-44 text-xs"
                      disabled={isSubmitting}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addSubcategory(c.id)}
                      disabled={isSubmitting || (!val.en.trim() && !val.ar.trim())}
                      className="h-8 gap-1.5 cursor-pointer text-xs"
                    >
                      {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
                      {t("Add", "إضافة")}
                    </Button>
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
