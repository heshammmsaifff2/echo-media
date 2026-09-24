"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  Plus, Pencil, Trash2, Star, GripVertical, Loader2,
  Camera, Play, Pause, SkipBack, SkipForward, Check,
  Upload, Film, X,
} from "lucide-react";
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

  // Video Frame Picker state
  const [thumbMode, setThumbMode] = useState<"video" | "upload">("video");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [capturedThumbPreview, setCapturedThumbPreview] = useState<string | null>(null);
  const [capturedThumbTime, setCapturedThumbTime] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const router = useRouter();
  const { isAr } = useI18n();

  useEffect(() => {
    if (mediaFile && (mediaFile.type.startsWith("video/") || form.media_type === "video")) {
      const url = URL.createObjectURL(mediaFile);
      setVideoPreviewUrl(url);
      setVideoCurrentTime(0);
      setVideoDuration(0);
      setIsVideoPlaying(false);
      setIsVideoReady(false);
      setCapturedThumbPreview(null);
      setCapturedThumbTime(null);
      setThumbMode("video");
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (!mediaFile && editing && editing.media_type === "video" && editing.media_url) {
      setVideoPreviewUrl(editing.media_url);
      setVideoCurrentTime(0);
      setVideoDuration(0);
      setIsVideoPlaying(false);
      setIsVideoReady(false);
      setCapturedThumbPreview(editing.thumbnail_url || null);
      setCapturedThumbTime(null);
    } else if (!mediaFile && !editing) {
      setVideoPreviewUrl(null);
      setCapturedThumbPreview(null);
      setCapturedThumbTime(null);
    }
  }, [mediaFile, editing, form.media_type]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setMediaFile(null);
    setThumbFile(null);
    setCapturedThumbPreview(null);
    setCapturedThumbTime(null);
    setVideoPreviewUrl(null);
    setThumbMode("video");
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
    setCapturedThumbPreview(item.thumbnail_url || null);
    setCapturedThumbTime(null);
    if (item.media_type === "video" && item.media_url) {
      setVideoPreviewUrl(item.media_url);
      setThumbMode(item.thumbnail_url ? "upload" : "video");
    } else {
      setVideoPreviewUrl(null);
    }
    setDialogOpen(true);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setVideoDuration(dur);
      setIsVideoReady(true);
      if (dur > 0 && !editing?.thumbnail_url) {
        const initialSeek = Math.min(1.0, dur / 2);
        videoRef.current.currentTime = initialSeek;
        setVideoCurrentTime(initialSeek);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (time: number) => {
    const clamped = Math.max(0, Math.min(time, videoDuration));
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
    setVideoCurrentTime(clamped);
  };

  const stepTime = (delta: number) => {
    handleSeek(videoCurrentTime + delta);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const fileName = `thumb_${Math.floor(video.currentTime * 10)}.jpg`;
          const file = new File([blob], fileName, { type: "image/jpeg" });
          setThumbFile(file);
          setCapturedThumbPreview(URL.createObjectURL(blob));
          setCapturedThumbTime(video.currentTime);
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("Failed to capture frame:", err);
      alert(
        isAr
          ? "تعذر التقاط الفريم مباشرة. يرجى تجربة رفع صورة يدوياً."
          : "Could not capture frame. Please try uploading an image manually."
      );
    }
  };

  const formatSeconds = (secs: number) => {
    if (!secs || isNaN(secs)) return "00:00.0";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ms}`;
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
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : (isAr ? "فشل الحفظ" : "Failed to save");
      alert(msg);
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
                <Input
                  type="file"
                  accept={form.media_type === "video" ? "video/*" : "image/*"}
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>

              {form.media_type === "video" ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Film size={16} className="text-primary" />
                      {isAr ? "الصورة المصغرة للفيديو (Thumbnail)" : "Video Thumbnail"}
                    </Label>
                    <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border/60 text-xs">
                      <button
                        type="button"
                        onClick={() => setThumbMode("video")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          thumbMode === "video"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Camera size={13} />
                        {isAr ? "التقاط من الفيديو" : "From Video"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbMode("upload")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          thumbMode === "upload"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Upload size={13} />
                        {isAr ? "رفع صورة يدوياً" : "Upload File"}
                      </button>
                    </div>
                  </div>

                  {thumbMode === "video" ? (
                    videoPreviewUrl ? (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden bg-black/90 aspect-video max-h-64 flex items-center justify-center border border-border/40 group">
                          <video
                            ref={videoRef}
                            src={videoPreviewUrl}
                            crossOrigin="anonymous"
                            preload="metadata"
                            onLoadedMetadata={handleLoadedMetadata}
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            className="w-full h-full object-contain cursor-pointer"
                            onClick={togglePlay}
                          />
                          <button
                            type="button"
                            onClick={togglePlay}
                            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                          >
                            {isVideoPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                          </button>
                        </div>

                        {/* Scrubber and controls */}
                        <div className="space-y-2 bg-background/60 p-3 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                            <span>{formatSeconds(videoCurrentTime)}</span>
                            <span>{formatSeconds(videoDuration)}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={videoDuration || 1}
                            step={0.05}
                            value={videoCurrentTime}
                            onChange={(e) => handleSeek(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => stepTime(-1)}
                                className="h-7 px-2 text-xs cursor-pointer"
                                title={isAr ? "رجوع 1 ثانية" : "-1 second"}
                              >
                                -1s
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => stepTime(-0.1)}
                                className="h-7 px-2 text-xs cursor-pointer"
                                title={isAr ? "رجوع فريم واحد" : "-0.1s"}
                              >
                                <SkipBack size={12} />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={togglePlay}
                                className="h-7 px-2.5 text-xs cursor-pointer"
                              >
                                {isVideoPlaying ? <Pause size={12} /> : <Play size={12} />}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => stepTime(0.1)}
                                className="h-7 px-2 text-xs cursor-pointer"
                                title={isAr ? "تقديم فريم واحد" : "+0.1s"}
                              >
                                <SkipForward size={12} />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => stepTime(1)}
                                className="h-7 px-2 text-xs cursor-pointer"
                                title={isAr ? "تقديم 1 ثانية" : "+1 second"}
                              >
                                +1s
                              </Button>
                            </div>

                            <Button
                              type="button"
                              onClick={handleCaptureFrame}
                              disabled={!isVideoReady}
                              className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
                            >
                              <Camera size={14} />
                              {isAr ? "التقاط هذا الفريم كصورة مصغرة" : "Capture Current Frame"}
                            </Button>
                          </div>
                        </div>

                        {/* Captured thumbnail preview */}
                        {capturedThumbPreview && (
                          <div className="flex items-center gap-3 p-2.5 rounded-lg border border-green-500/30 bg-green-500/5">
                            <div className="w-20 h-14 rounded-md overflow-hidden bg-black flex-shrink-0 relative border border-border">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={capturedThumbPreview}
                                alt="Captured Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                <Check size={14} />
                                {isAr ? "تم اعتماد هذا الفريم كصورة مصغرة" : "Frame selected as thumbnail"}
                              </p>
                              {capturedThumbTime !== null && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {isAr ? `التوقيت: ${formatSeconds(capturedThumbTime)}` : `Timestamp: ${formatSeconds(capturedThumbTime)}`}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setThumbFile(null);
                                setCapturedThumbPreview(null);
                                setCapturedThumbTime(null);
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                              title={isAr ? "إلغاء التحديد" : "Clear"}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center text-xs text-muted-foreground">
                        <Film size={24} className="mx-auto mb-2 opacity-40 text-primary" />
                        <p>{isAr ? "قم باختيار ملف فيديو أعلاه أولاً ليظهر المشغّل هنا وتحدد الفريم المطلوب" : "Upload a video file above first to preview and pick a frame"}</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setThumbFile(file);
                          if (file) {
                            setCapturedThumbPreview(URL.createObjectURL(file));
                            setCapturedThumbTime(null);
                          }
                        }}
                      />
                      {capturedThumbPreview && (
                        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background/50">
                          <div className="w-20 h-14 rounded-md overflow-hidden bg-black flex-shrink-0 relative border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={capturedThumbPreview}
                              alt="Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{isAr ? "معاينة الصورة المرفقة" : "Attached Image Preview"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{thumbFile?.name || (isAr ? "صورة العمل الحالية" : "Current thumbnail")}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>{isAr ? "صورة مصغرة (اختياري)" : "Thumbnail (optional)"}</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
                </div>
              )}
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
