"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/upload";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Star, GripVertical, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type PortfolioItem = {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  media_url: string;
  thumbnail_url: string | null;
  media_type: string;
  is_featured: boolean;
  order_index: number;
};

const EMPTY_FORM = {
  title_en: "", title_ar: "", description_en: "", description_ar: "",
  category: "reels", media_type: "video", is_featured: false,
};

export function PortfolioManager({ initialItems }: { initialItems: PortfolioItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAr } = useI18n();

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setMediaFile(null);
    setThumbFile(null);
    setDialogOpen(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm({
      title_en: item.title_en, title_ar: item.title_ar,
      description_en: item.description_en, description_ar: item.description_ar,
      category: item.category, media_type: item.media_type, is_featured: item.is_featured,
    });
    setMediaFile(null);
    setThumbFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      let media_url = editing?.media_url || "";
      let thumbnail_url = editing?.thumbnail_url || null;

      if (mediaFile) {
        const res = await uploadToCloudinary(mediaFile, "echo/portfolio");
        media_url = res.url;
      }
      if (thumbFile) {
        const res = await uploadToCloudinary(thumbFile, "echo/thumbnails");
        thumbnail_url = res.url;
      }

      if (!media_url && !editing) {
        alert(isAr ? "يرجى رفع ملف الوسائط" : "Please upload a media file");
        setLoading(false);
        return;
      }

      const payload = {
        title_en: form.title_en, title_ar: form.title_ar,
        description_en: form.description_en, description_ar: form.description_ar,
        category: form.category, media_type: form.media_type,
        media_url, thumbnail_url, is_featured: form.is_featured,
        order_index: editing?.order_index ?? items.length,
      };

      if (editing) {
        await supabase.from("portfolio_items").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("portfolio_items").insert(payload);
      }

      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(isAr ? "فشل الحفظ" : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "حذف هذا العنصر؟" : "Delete this item?")) return;
    const item = items.find((i) => i.id === id);
    const supabase = createClient();
    await supabase.from("portfolio_items").delete().eq("id", id);

    if (item) {
      const urls = [item.media_url, item.thumbnail_url].filter(Boolean) as string[];
      if (urls.length > 0) {
        fetch("/api/cloudinary-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls }),
        }).catch(() => {});
      }
    }

    setItems(items.filter((i) => i.id !== id));
    router.refresh();
  };

  const toggleFeatured = async (item: PortfolioItem) => {
    const supabase = createClient();
    await supabase.from("portfolio_items").update({ is_featured: !item.is_featured }).eq("id", item.id);
    setItems(items.map((i) => i.id === item.id ? { ...i, is_featured: !i.is_featured } : i));
  };

  const categories: Record<string, string> = {
    reels: isAr ? "ريلز" : "Reels",
    video: isAr ? "فيديو" : "Video",
    podcasts: isAr ? "بودكاست" : "Podcasts",
    photos: isAr ? "صور" : "Photos",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isAr ? "إدارة الأعمال" : "Portfolio Management"}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2 cursor-pointer">
              <Plus size={16} /> {isAr ? "إضافة عمل" : "Add Item"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? (isAr ? "تعديل العمل" : "Edit Item") : (isAr ? "إضافة عمل جديد" : "Add New Item")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{isAr ? "العنوان (إنجليزي)" : "Title (English)"}</Label>
                  <Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>{isAr ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                  <Input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{isAr ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
                  <Textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={3} />
                </div>
                <div className="grid gap-2">
                  <Label>{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                  <Textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} rows={3} dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{isAr ? "التصنيف" : "Category"}</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{isAr ? "نوع الوسائط" : "Media Type"}</Label>
                  <Select value={form.media_type} onValueChange={(v) => setForm({ ...form, media_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">{isAr ? "فيديو" : "Video"}</SelectItem>
                      <SelectItem value="image">{isAr ? "صورة" : "Image"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{isAr ? "ملف الوسائط" : "Media File"} {editing && (isAr ? "(اتركه فارغاً للإبقاء على الحالي)" : "(leave empty to keep current)")}</Label>
                <Input type="file" accept="video/*,image/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid gap-2">
                <Label>{isAr ? "صورة مصغرة (اختياري)" : "Thumbnail (optional)"}</Label>
                <Input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">{isAr ? "مميز على الصفحة الرئيسية" : "Featured on homepage"}</span>
              </label>
              <Button onClick={handleSubmit} disabled={loading} className="cursor-pointer">
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> {isAr ? "جاري الحفظ..." : "Saving..."}</> : (isAr ? "حفظ" : "Save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isAr ? "لا توجد أعمال بعد. اضغط \"إضافة عمل\" لإنشاء عنصر جديد." : "No portfolio items yet. Click \"Add Item\" to create one."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 py-3">
                <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                  {(item.thumbnail_url || item.media_type === "image") ? (
                    <Image
                      src={item.thumbnail_url || item.media_url}
                      alt={isAr ? item.title_ar : item.title_en}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-violet-500/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{isAr ? item.title_ar : item.title_en}</p>
                  <p className="text-xs text-muted-foreground capitalize">{categories[item.category] || item.category} &middot; {item.media_type === "video" ? (isAr ? "فيديو" : "Video") : (isAr ? "صورة" : "Image")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeatured(item)}
                    className="cursor-pointer"
                    title={item.is_featured ? (isAr ? "إلغاء التمييز" : "Unfeature") : (isAr ? "تمييز" : "Feature")}
                  >
                    <Star size={16} className={item.is_featured ? "fill-amber-500 text-amber-500" : "text-muted-foreground"} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="cursor-pointer">
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive cursor-pointer">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
