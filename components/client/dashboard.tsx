"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/upload";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Lock, Unlock, Loader2, Check, Download, ExternalLink, FileText, CreditCard,
  Clock, Timer, AlertTriangle, Eye, Trash2, FileVideo, FileArchive, FileImage,
  Receipt, Banknote, Plus, Share2, Info, X, CheckCircle2, Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type Payment, confirmedTotal, remainingBalance, isFullyPaid } from "@/lib/payments";

function getDirectDownloadUrl(url: string) {
  if (!url) return url;
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    return url;
  }
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("/fl_attachment")) return url;
    return url.replace("/upload/", "/upload/fl_attachment/");
  }
  return url;
}

function getDeliveryFileMeta(url: string, isAr: boolean) {
  try {
    const isDrive = url.includes("drive.google.com") || url.includes("docs.google.com");
    if (isDrive) {
      return { name: isAr ? "رابط Google Drive" : "Google Drive Link", ext: "DRIVE", label: isAr ? "رابط خارجي على Google Drive" : "External link on Google Drive", isArchive: false, isZip: false, isVideo: false, isImage: false, isDrive: true };
    }
    const clean = url.split("?")[0];
    const rawName = clean.substring(clean.lastIndexOf("/") + 1);
    const decodedName = decodeURIComponent(rawName) || url;
    const ext = rawName.split(".").pop()?.toLowerCase() || "";
    const ARCHIVE = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz", "tbz2", "zipx", "iso", "cab", "arj", "lzh", "z", "lzma"];
    const isArchive = ARCHIVE.includes(ext) || url.includes("/raw/upload/");
    const isVideo = ["mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv"].includes(ext) || url.includes("/video/upload/");
    const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext) || url.includes("/image/upload/");
    const extUpper = (ext || (isVideo ? "video" : isArchive ? "archive" : isImage ? "image" : "file")).toUpperCase();
    let label = isAr ? "ملف تسليم" : "Deliverable File";
    if (isVideo) label = isAr ? `ملف فيديو عالي الجودة (${extUpper})` : `High-Quality Video (${extUpper})`;
    else if (isArchive) label = isAr ? `أرشيف مضغوط (${extUpper})` : `${extUpper} Compressed Archive`;
    else if (isImage) label = isAr ? `ملف صورة (${extUpper})` : `Image File (${extUpper})`;
    return { name: decodedName, ext: extUpper, label, isArchive, isZip: isArchive, isVideo, isImage, isDrive: false };
  } catch {
    return { name: url, ext: "FILE", label: isAr ? "ملف تسليم" : "Deliverable File", isArchive: false, isZip: false, isVideo: false, isImage: false, isDrive: false };
  }
}

type Order = {
  id: string;
  project_title: string;
  project_description: string | null;
  total_amount: number;
  is_confirmed_by_admin: boolean;
  delivery_type: string | null;
  delivery_files: string[];
  delivery_unlocked_at: string | null;
  delivery_expired: boolean;
  created_at: string;
  order_payments: Payment[];
};

type Profile = { full_name: string; email: string };

export function ClientDashboard({ orders, profile }: { orders: Order[]; profile: Profile }) {
  const { isAr } = useI18n();

  useEffect(() => {
    fetch("/api/cleanup-expired", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{isAr ? `مرحباً، ${profile.full_name || ""}` : `Welcome, ${profile.full_name || ""}`}</h1>
        <p className="text-muted-foreground mt-1">{isAr ? "لوحة التحكم — مشاريعك ومدفوعاتك" : "Your projects and payments dashboard"}</p>
      </div>

      {orders.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{isAr ? "لا توجد مشاريع حالياً" : "No projects assigned yet"}</CardContent></Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (<OrderCard key={order.id} order={{ ...order, order_payments: order.order_payments || [] }} isAr={isAr} />))}
        </div>
      )}
    </div>
  );
}

function useCountdown(targetDate: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!targetDate) return;
    const expiresAt = new Date(targetDate).getTime() + 7 * 24 * 60 * 60 * 1000;
    const update = () => { const diff = expiresAt - Date.now(); setRemaining(diff > 0 ? diff : 0); };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return remaining;
}

function formatCountdown(ms: number, isAr: boolean) {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return isAr ? `${days} يوم و ${hours} ساعة متبقية` : `${days}d ${hours}h remaining`;
  if (hours > 0) return isAr ? `${hours} ساعة و ${minutes} دقيقة متبقية` : `${hours}h ${minutes}m remaining`;
  return isAr ? `${minutes} دقيقة متبقية` : `${minutes}m remaining`;
}

type DeviceType = "ios" | "android" | "desktop";

function AppleIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.61-7.8-11.73-14.14-5.37-8.31-9.5-17.71-12.39-28.18-2.88-10.47-4.33-20.64-4.33-30.52 0-14.88 3.84-27.24 11.51-37.09 7.68-9.84 17.09-14.86 28.24-15.06 5.26 0 10.85 1.44 16.78 4.31 5.92 2.88 9.77 4.37 11.53 4.48 1.54 0 5.48-1.57 11.83-4.71 6.34-3.14 11.9-4.52 16.67-4.14 12.8.64 22.95 5.76 30.43 15.35-11.18 6.77-16.66 16.03-16.43 27.76.24 9.17 3.75 16.89 10.54 23.16 6.79 6.27 14.88 9.72 24.28 10.36-2.45 7.42-5.48 15.02-9.08 22.8zM119.22 31.84c0-7.72 2.76-14.97 8.28-21.75 5.53-6.77 12.41-10.79 20.64-12.06.13 1.09.2 2.05.2 2.88 0 7.5-2.91 14.76-8.73 21.79-5.83 7.03-12.87 10.96-21.13 11.8-0.26-.88-.41-1.77-.41-2.66z" />
    </svg>
  );
}

function AndroidIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.997-3.459a.416.416 0 00-.1521-.5676.416.416 0 00-.568.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.1 12 8.1c-1.8533 0-3.5902.3116-5.1361.8499L4.8416 5.4469a.4161.4161 0 00-.568-.1521.4158.4158 0 00-.1521.5676l1.997 3.459C2.6889 10.9757 0 14.5304 0 18.7h24c0-4.1696-2.6889-7.7243-6.1185-9.3786" />
    </svg>
  );
}

function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || navigator.vendor || "";
    const isIOS =
      /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      setDeviceType("ios");
    } else if (/android/i.test(ua)) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }
  }, []);

  return deviceType;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) {
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

type DownloadState = {
  index: number;
  name: string;
  loaded: number;
  total: number;
  percent: number | null;
  status: "starting" | "downloading" | "processing" | "ready_to_save" | "error";
  error?: string;
  file?: File;
  directUrl?: string;
};

function OrderCard({ order, isAr }: { order: Order; isAr: boolean }) {
  const router = useRouter();
  const deviceType = useDeviceType();
  const remaining = useCountdown(order.delivery_unlocked_at);
  const [uploading, setUploading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [receiptView, setReceiptView] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const cancelDownload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setDownloadState(null);
  };

  const triggerSaveToPhotos = async () => {
    if (!downloadState?.file) return;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        if (navigator.canShare && navigator.canShare({ files: [downloadState.file] })) {
          await navigator.share({
            files: [downloadState.file],
            title: downloadState.name,
          });
          setDownloadState(null);
          return;
        } else if (downloadState.directUrl) {
          await navigator.share({
            title: downloadState.name,
            url: downloadState.directUrl,
          });
          setDownloadState(null);
          return;
        }
      }
      if (downloadState.directUrl) {
        const a = document.createElement("a");
        a.href = downloadState.directUrl;
        a.download = downloadState.name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setDownloadState(null);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        setDownloadState(null);
        return;
      }
      console.error("Save error:", err);
      setDownloadState(null);
    }
  };

  const handleShareOrSave = async (url: string, meta: ReturnType<typeof getDeliveryFileMeta>, index: number) => {
    if (downloadState) return;

    const directUrl = getDirectDownloadUrl(url);

    setDownloadState({
      index,
      name: meta.name,
      loaded: 0,
      total: 0,
      percent: 0,
      status: "starting",
      directUrl,
    });

    try {
      // XHR reports true byte-by-byte download progress on iOS Safari, where a
      // streaming fetch reader is buffered and never updates incrementally.
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("GET", url, true);
        xhr.responseType = "blob";

        xhr.onprogress = (e) => {
          const total = e.lengthComputable ? e.total : 0;
          const percent = total > 0 ? Math.min(100, Math.round((e.loaded / total) * 100)) : null;
          setDownloadState({
            index,
            name: meta.name,
            loaded: e.loaded,
            total,
            percent,
            status: "downloading",
            directUrl,
          });
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            resolve(xhr.response as Blob);
          } else {
            reject(new Error(isAr ? `فشل تحميل الملف (رمز الخطأ ${xhr.status})` : `Failed to fetch file (${xhr.status})`));
          }
        };
        xhr.onerror = () =>
          reject(new Error(isAr ? "فشل الاتصال بالخادم أثناء التحميل" : "Network error while downloading"));
        xhr.onabort = () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        xhr.send();
      });

      const size = blob.size;
      setDownloadState({
        index,
        name: meta.name,
        loaded: size,
        total: size,
        percent: 100,
        status: "processing",
        directUrl,
      });

      const ext = meta.name.split(".").pop()?.toLowerCase() || (meta.isVideo ? "mp4" : "jpg");
      const mime =
        blob.type ||
        (meta.isVideo
          ? (ext === "mov" ? "video/quicktime" : "video/mp4")
          : meta.isImage
            ? `image/${ext}`
            : "application/octet-stream");
      const file = new File([blob], meta.name, { type: mime });

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: meta.name,
            });
            setDownloadState(null);
            return;
          } else {
            await navigator.share({
              title: meta.name,
              url: directUrl,
            });
            setDownloadState(null);
            return;
          }
        } catch (shareErr) {
          if ((shareErr as Error)?.name === "AbortError") {
            setDownloadState(null);
            return;
          }
          // If Safari blocked auto-share due to expired transient activation, prompt user to tap
          setDownloadState({
            index,
            name: meta.name,
            loaded: size,
            total: size,
            percent: 100,
            status: "ready_to_save",
            file,
            directUrl,
          });
          return;
        }
      }

      // If Web Share API is not available:
      const a = document.createElement("a");
      a.href = directUrl;
      a.download = meta.name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadState(null);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        setDownloadState(null);
        return;
      }
      console.error("Download/Share error:", err);
      setDownloadState({
        index,
        name: meta.name,
        loaded: 0,
        total: 0,
        percent: null,
        status: "error",
        error: (err as Error)?.message || (isAr ? "فشل التحميل" : "Download failed"),
        directUrl,
      });
    } finally {
      xhrRef.current = null;
    }
  };

  const payments = order.order_payments || [];
  const paid = confirmedTotal(payments);
  const balance = remainingBalance(order.total_amount, payments);
  const fullyPaid = isFullyPaid(order.total_amount, payments);
  const currency = isAr ? "ج.م" : "EGP";
  const fmt = (n: number) => Number(n || 0).toLocaleString();
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(isAr ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });

  const submitReceipt = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, "echo/receipts");
      const supabase = createClient();
      const { error } = await supabase.from("order_payments").insert({
        order_id: order.id,
        amount: parseFloat(amount) || 0,
        receipt_url: url,
        created_by: "client",
        is_confirmed: false,
        is_cash: false,
      });
      if (error) throw error;
      setAddOpen(false);
      setAmount("");
      setFile(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : (isAr ? "فشل رفع الإيصال" : "Failed to upload receipt"));
    } finally {
      setUploading(false);
    }
  };

  const removePending = async (id: string) => {
    if (!confirm(isAr ? "حذف هذا الإيصال؟" : "Remove this receipt?")) return;
    const supabase = createClient();
    await supabase.from("order_payments").delete().eq("id", id);
    router.refresh();
  };

  const isLocked = !order.is_confirmed_by_admin;
  const hasDelivery = (order.delivery_files || []).length > 0;
  const isExpired = order.delivery_expired || (remaining !== null && remaining <= 0 && hasDelivery);
  const isUrgent = remaining !== null && remaining > 0 && remaining < 24 * 60 * 60 * 1000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{order.project_title}</CardTitle>
            {order.project_description && <p className="text-sm text-muted-foreground mt-1">{order.project_description}</p>}
          </div>
          {isExpired ? (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1"><AlertTriangle size={12} /> {isAr ? "منتهي" : "Expired"}</Badge>
          ) : isLocked ? (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1"><Lock size={12} /> {isAr ? "مقفل" : "Locked"}</Badge>
          ) : (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1"><Unlock size={12} /> {isAr ? "مفتوح" : "Unlocked"}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <CreditCard size={20} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-1">{isAr ? "الإجمالي" : "Total"}</p>
            <p className="text-lg font-bold">{fmt(order.total_amount)}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
          <div className="rounded-xl bg-green-500/5 p-4 text-center">
            <Check size={20} className="mx-auto mb-2 text-green-500" />
            <p className="text-xs text-muted-foreground mb-1">{isAr ? "المدفوع" : "Paid"}</p>
            <p className="text-lg font-bold text-green-500">{fmt(paid)}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
          <div className="rounded-xl bg-amber-500/5 p-4 text-center">
            <Clock size={20} className="mx-auto mb-2 text-amber-500" />
            <p className="text-xs text-muted-foreground mb-1">{isAr ? "المتبقي" : "Remaining"}</p>
            <p className="text-lg font-bold text-amber-500">{fmt(balance)}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
        </div>

        {/* Payment history + submit a receipt */}
        <Separator className="my-4" />
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">{isAr ? "الدفعات" : "Payments"}</h4>
            {!fullyPaid && (
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1.5 cursor-pointer"><Plus size={14} /> {isAr ? "رفع إيصال دفعة" : "Upload a receipt"}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{isAr ? "رفع إيصال دفعة" : "Upload payment receipt"}</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-2">
                    <p className="text-sm text-muted-foreground">
                      {isAr ? "حوّل عبر فودافون كاش أو إنستاباي ثم ارفع الإيصال. سيؤكّد الأدمن المبلغ." : "Transfer via Vodafone Cash or InstaPay, then upload the receipt. The admin will confirm the amount."}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-card p-3 border border-border/50"><p className="font-medium">Vodafone Cash</p><p className="text-muted-foreground">010 XXXX XXXX</p></div>
                      <div className="rounded-lg bg-card p-3 border border-border/50"><p className="font-medium">InstaPay</p><p className="text-muted-foreground">echo@instapay</p></div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{isAr ? `المبلغ (${currency}) — اختياري` : `Amount (${currency}) — optional`}</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={isAr ? "مثال: 5000" : "e.g. 5000"} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{isAr ? "ملف الإيصال" : "Receipt file"}</Label>
                      <Input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                    <Button onClick={submitReceipt} disabled={uploading || !file} className="cursor-pointer">
                      {uploading ? <><Loader2 size={16} className="animate-spin mr-2" /> {isAr ? "جاري الرفع..." : "Uploading..."}</> : (isAr ? "إرسال الإيصال" : "Submit receipt")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">{isAr ? "لا توجد دفعات بعد" : "No payments yet"}</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-2.5">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${p.is_cash ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}>
                    {p.is_cash ? <Banknote size={16} /> : <Receipt size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {p.is_confirmed ? `${fmt(p.amount)} ${currency}` : (isAr ? "بانتظار تأكيد الأدمن" : "Awaiting admin confirmation")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{p.is_cash ? (isAr ? "كاش" : "Cash") : (isAr ? "إيصال" : "Receipt")} · {fmtDate(p.created_at)}</p>
                  </div>
                  {p.is_confirmed ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1"><Check size={11} /> {isAr ? "مؤكد" : "Confirmed"}</Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{isAr ? "قيد المراجعة" : "Pending"}</Badge>
                  )}
                  {p.receipt_url && (
                    <Dialog open={receiptView === p.id} onOpenChange={(o) => setReceiptView(o ? p.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title={isAr ? "معاينة" : "View"}><Eye size={15} /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>{isAr ? "إيصال الدفع" : "Payment Receipt"}</DialogTitle></DialogHeader>
                        {p.receipt_url.toLowerCase().includes(".pdf") ? (
                          <div className="py-8 text-center space-y-4"><FileText size={48} className="mx-auto text-muted-foreground" /><Button asChild size="sm" className="gap-1.5"><a href={p.receipt_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> {isAr ? "فتح" : "Open"}</a></Button></div>
                        ) : (
                          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-muted"><Image src={p.receipt_url} alt="Receipt" fill className="object-contain" sizes="500px" /></div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}
                  {!p.is_confirmed && p.created_by === "client" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive cursor-pointer" onClick={() => removePending(p.id)} title={isAr ? "حذف" : "Remove"}><Trash2 size={15} /></Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div>
          <h4 className="font-medium text-sm mb-3">{isAr ? "ملفات التسليم" : "Deliverables"}</h4>
          {isExpired ? (
            <div className="rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-6 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3 text-red-500/50" />
              <p className="text-sm font-medium text-red-500">{isAr ? "انتهت صلاحية الملفات. تم تسليم المشروع بنجاح." : "Files have expired. Project was delivered successfully."}</p>
              <p className="text-xs text-muted-foreground mt-1">{isAr ? "تم حذف الملفات تلقائياً بعد انتهاء فترة الـ 7 أيام." : "Files were automatically removed after the 7-day download window."}</p>
            </div>
          ) : isLocked ? (
            <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center">
              <Lock size={32} className="mx-auto mb-3 text-amber-500/50" />
              <p className="text-sm font-medium text-amber-500">{isAr ? "تُفتح ملفات التسليم بعد سداد المبلغ بالكامل وتأكيد الأدمن." : "Deliverables unlock once the full amount is paid and confirmed."}</p>
            </div>
          ) : hasDelivery ? (
            <div>
              {remaining !== null && remaining > 0 && (
                <div className={`flex items-center gap-2 text-sm mb-3 p-3 rounded-lg ${isUrgent ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
                  <Timer size={16} /><span className="font-medium">{formatCountdown(remaining, isAr)}</span>
                  <span className="text-xs opacity-75">{isAr ? "— حمّل الملفات قبل انتهاء المهلة" : "— download before time runs out"}</span>
                </div>
              )}
              <div className="grid gap-2.5">
                {order.delivery_files.map((url, i) => {
                  const meta = getDeliveryFileMeta(url, isAr);
                  const downloadUrl = getDirectDownloadUrl(url);
                  return (
                    <div key={i} className="rounded-xl border border-border/60 bg-card p-3.5 hover:border-primary/40 transition-all shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.isVideo ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" : meta.isZip ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : meta.isDrive ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : meta.isImage ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                            {meta.isVideo ? <FileVideo size={20} /> : meta.isZip ? <FileArchive size={20} /> : meta.isDrive ? <ExternalLink size={20} /> : meta.isImage ? <FileImage size={20} /> : <Download size={20} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold truncate text-foreground" title={meta.name}>{meta.name}</p>
                              <Badge variant="outline" className="text-[10px] font-mono uppercase px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">{meta.ext}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{meta.label}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                          {meta.isDrive ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex-shrink-0 shadow-sm cursor-pointer"
                            >
                              <ExternalLink size={13} />
                              <span>{isAr ? "فتح الرابط" : "Open Link"}</span>
                            </a>
                          ) : deviceType === "ios" ? (
                            meta.isVideo || meta.isImage ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  if (downloadState?.index === i && downloadState.status === "ready_to_save") {
                                    triggerSaveToPhotos();
                                  } else {
                                    handleShareOrSave(url, meta, i);
                                  }
                                }}
                                disabled={downloadState !== null && downloadState.index !== i}
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 h-auto rounded-lg transition-all cursor-pointer shadow-sm ${
                                  downloadState?.index === i && downloadState.status === "ready_to_save"
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                } disabled:opacity-60`}
                                title={isAr ? "تحميل وحفظ في ألبوم الصور (Photos)" : "Download and save to Photos"}
                              >
                                {downloadState?.index === i ? (
                                  downloadState.status === "ready_to_save" ? (
                                    <>
                                      <Smartphone size={13} />
                                      <span>{isAr ? "احفظ في الصور" : "Save to Photos"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Loader2 size={13} className="animate-spin" />
                                      <span>
                                        {downloadState.status === "processing"
                                          ? (isAr ? "جارِ التجهيز..." : "Preparing...")
                                          : downloadState.percent !== null
                                            ? `${downloadState.percent}%`
                                            : (isAr ? "جارِ التحميل..." : "Downloading...")}
                                      </span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <AppleIcon className="w-3.5 h-3.5 fill-current" />
                                    <span>{isAr ? "تحميل للآيفون" : "Download for iPhone"}</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <a
                                href={downloadUrl}
                                download={meta.name}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex-shrink-0 shadow-sm cursor-pointer"
                              >
                                <Download size={13} />
                                <span>{isAr ? `تحميل الملف (${meta.ext})` : `Download (${meta.ext})`}</span>
                              </a>
                            )
                          ) : deviceType === "android" ? (
                            <a
                              href={downloadUrl}
                              download={meta.name}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex-shrink-0 shadow-sm cursor-pointer"
                              title={isAr ? "تحميل وحفظ في الاستوديو للأندرويد" : "Download to Android Gallery"}
                            >
                              <AndroidIcon className="w-3.5 h-3.5 fill-current" />
                              <span>{isAr ? "تحميل للأندرويد" : "Download for Android"}</span>
                            </a>
                          ) : (
                            <a
                              href={downloadUrl}
                              download={meta.name}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex-shrink-0 shadow-sm cursor-pointer"
                            >
                              <Download size={13} />
                              <span>{isAr ? `تحميل (${meta.ext})` : `Download (${meta.ext})`}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Inline Progress Bar for iOS & active downloads */}
                      {downloadState && downloadState.index === i && (
                        <div className="mt-3.5 pt-3.5 border-t border-border/60 space-y-2.5 animate-in fade-in-50 duration-200">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full ${
                                downloadState.status === "ready_to_save"
                                  ? "bg-emerald-500"
                                  : downloadState.status === "error"
                                    ? "bg-red-500"
                                    : "bg-primary animate-ping"
                              }`} />
                              <span className="font-semibold text-foreground truncate">
                                {downloadState.status === "starting"
                                  ? (isAr ? "جارِ بدء الاتصال..." : "Connecting...")
                                  : downloadState.status === "downloading"
                                    ? (isAr ? "جاري تحميل الفيديو إلى جهازك..." : "Downloading video to your device...")
                                    : downloadState.status === "processing"
                                      ? (isAr ? "تم التحميل! جارِ تجهيز الملف..." : "Downloaded! Preparing file...")
                                      : downloadState.status === "ready_to_save"
                                        ? (isAr ? "اكتمل التحميل بنجاح (100%)!" : "Download complete (100%)!")
                                        : (isAr ? "حدث خطأ أثناء التحميل" : "Download error")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                              {downloadState.percent !== null && (
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                  downloadState.status === "ready_to_save"
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                                    : "bg-primary/10 text-primary border border-primary/20"
                                }`}>
                                  {downloadState.percent}%
                                </span>
                              )}
                              <span className="text-muted-foreground">
                                {formatFileSize(downloadState.loaded)}
                                {downloadState.total > 0 && ` / ${formatFileSize(downloadState.total)}`}
                              </span>
                            </div>
                          </div>

                          {/* Progress track */}
                          {downloadState.status !== "error" && (
                            <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/40">
                              <div
                                className={`h-full rounded-full transition-all duration-150 ${
                                  downloadState.status === "ready_to_save" || downloadState.status === "processing"
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-primary/80 via-primary to-primary shadow-sm"
                                }`}
                                style={{
                                  width: downloadState.percent !== null ? `${downloadState.percent}%` : "100%",
                                  transition: "width 0.15s ease-out",
                                }}
                              />
                            </div>
                          )}

                          {/* Footer Action & Guidance */}
                          {downloadState.status === "ready_to_save" ? (
                            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                {isAr
                                  ? "✓ اضغط الزر أدناه لحفظ الفيديو مباشرة في ألبوم الصور (Photos)."
                                  : "✓ Tap the button below to save video directly to Photos."}
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                onClick={triggerSaveToPhotos}
                                className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm"
                              >
                                <Smartphone size={13} />
                                <span>{isAr ? "حفظ في ألبوم الصور" : "Save to Photos"}</span>
                              </Button>
                            </div>
                          ) : downloadState.status === "error" ? (
                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="text-red-500 text-[11px]">{downloadState.error}</span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={downloadState.directUrl}
                                  target="_blank"
                                  download={downloadState.name}
                                  className="text-xs font-semibold text-primary underline"
                                >
                                  {isAr ? "رابط بديل مباشر" : "Direct Link"}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setDownloadState(null)}
                                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                                >
                                  {isAr ? "إغلاق" : "Close"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                              <p className="text-muted-foreground">
                                {isAr
                                  ? "⏳ يرجى إبقاء هذه الصفحة مفتوحة حتى يكتمل التحميل وتظهر نافذة الحفظ."
                                  : "⏳ Keep this page open until download finishes and save menu appears."}
                              </p>
                              <button
                                type="button"
                                onClick={cancelDownload}
                                className="text-muted-foreground hover:text-red-500 transition-colors text-[11px] underline flex-shrink-0 cursor-pointer"
                              >
                                {isAr ? "إلغاء التحميل" : "Cancel"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  {deviceType === "ios" ? (
                    <>
                      <p className="font-semibold text-foreground">
                        {isAr ? "💡 معلومة لمستخدمي الآيفون (iOS):" : "💡 Tip for iPhone (iOS) users:"}
                      </p>
                      <p>
                        {isAr
                          ? "• اضغط «تحميل للآيفون»، سيظهر لك مؤشر تقدم التحميل بالنسبة المئوية (%)، ثم اختر «حفظ الفيديو» (Save Video) من نافذة المشاركة ليتم حفظه مباشرة في ألبوم الصور (Photos)."
                          : "• Tap «Download for iPhone», you will see a live progress indicator (%), then select «Save Video» from the share sheet to save directly into your Photos app."}
                      </p>
                    </>
                  ) : deviceType === "android" ? (
                    <>
                      <p className="font-semibold text-foreground">
                        {isAr ? "💡 معلومة لمستخدمي الأندرويد (Android):" : "💡 Tip for Android users:"}
                      </p>
                      <p>
                        {isAr
                          ? "• اضغط «تحميل للأندرويد»، وسيتم حفظ الفيديو تلقائياً في مجلد التنزيلات وتجده داخل تطبيق الاستوديو (معرض الصور)."
                          : "• Tap «Download for Android», the video will be saved to your Downloads folder and will appear in your Gallery app."}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">
                        {isAr ? "💡 معلومة لمستخدمي الهاتف والكمبيوتر:" : "💡 Download Tip:"}
                      </p>
                      <p>
                        {isAr
                          ? "• على الآيفون: اضغط «تحميل للآيفون» لحفظه في ألبوم الصور. على الأندرويد والكمبيوتر: يتم حفظ الملف مباشرة في مجلد التنزيلات."
                          : "• On iPhone: Tap «Download for iPhone» to save to Photos. On Android and PC: Files are saved to your Downloads folder."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-6 text-center text-muted-foreground text-sm">{isAr ? "لم يتم إرفاق ملفات بعد" : "No deliverables attached yet"}</div>
          )}
        </div>
      </CardContent>

      {/* Floating Bottom Progress Indicator for Mobile/iPhone */}
      {downloadState && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all ${
            downloadState.status === "ready_to_save"
              ? "border-emerald-500/50 bg-card/95 text-foreground ring-2 ring-emerald-500/20"
              : downloadState.status === "error"
                ? "border-red-500/40 bg-card/95 text-foreground"
                : "border-primary/40 bg-card/95 text-foreground"
          }`}>
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  downloadState.status === "ready_to_save"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : downloadState.status === "error"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-primary/10 text-primary border-primary/20"
                }`}>
                  {downloadState.status === "ready_to_save" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in" />
                  ) : downloadState.status === "error" ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : (
                    <FileVideo className="w-5 h-5 text-primary animate-pulse" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground" title={downloadState.name}>
                    {downloadState.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {downloadState.status === "starting"
                      ? (isAr ? "جارِ بدء الاتصال..." : "Connecting...")
                      : downloadState.status === "downloading"
                        ? (isAr ? "جاري التحميل للآيفون..." : "Downloading to iPhone...")
                        : downloadState.status === "processing"
                          ? (isAr ? "جارِ تجهيز الفيديو..." : "Processing video...")
                          : downloadState.status === "ready_to_save"
                            ? (isAr ? "جاهز للحفظ في ألبوم الصور!" : "Ready to save to Photos!")
                            : (isAr ? "حدث خطأ أثناء التحميل" : "Download failed")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {downloadState.percent !== null && (
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs font-bold ${
                      downloadState.status === "ready_to_save"
                        ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                        : "text-primary border-primary/30 bg-primary/10"
                    }`}
                  >
                    {downloadState.percent}%
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={cancelDownload}
                  className="w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={isAr ? "إغلاق" : "Close"}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Progress track */}
            {downloadState.status !== "error" && (
              <div className="w-full bg-muted/70 rounded-full h-2 overflow-hidden mb-2 border border-border/30">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    downloadState.status === "ready_to_save" || downloadState.status === "processing"
                      ? "bg-emerald-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${downloadState.percent ?? 100}%` }}
                />
              </div>
            )}

            {/* Footer action/info */}
            {downloadState.status === "ready_to_save" ? (
              <div className="mt-2.5 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  onClick={triggerSaveToPhotos}
                  className="w-full h-9 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                >
                  <Smartphone size={14} />
                  <span>{isAr ? "اضغط هنا لحفظ الفيديو في الصور (Photos)" : "Tap to Save Video to Photos"}</span>
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                  {isAr
                    ? "اختر «حفظ الفيديو» (Save Video) من نافذة المشاركة"
                    : "Select «Save Video» from the popup share sheet"}
                </p>
              </div>
            ) : downloadState.status === "error" ? (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-red-500 text-[11px]">{downloadState.error}</span>
                <a
                  href={downloadState.directUrl}
                  target="_blank"
                  download={downloadState.name}
                  className="text-xs font-semibold text-primary underline"
                >
                  {isAr ? "تنزيل مباشر" : "Direct Download"}
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>
                  {formatFileSize(downloadState.loaded)}
                  {downloadState.total > 0 && ` / ${formatFileSize(downloadState.total)}`}
                </span>
                <span className="font-sans text-[10px] text-amber-500/90 font-medium">
                  {isAr ? "⏳ لا تغلق الصفحة حتى يكتمل" : "⏳ Keep page open"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
