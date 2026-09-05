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
  Lock, Unlock, Loader2, Check, Download,
  ExternalLink, FileText, CreditCard, Clock, Timer, AlertTriangle,
  Eye, Trash2, FileVideo, FileArchive, FileImage,
} from "lucide-react";
import { useRouter } from "next/navigation";

function getDeliveryFileMeta(url: string, isAr: boolean) {
  try {
    const isDrive = url.includes("drive.google.com") || url.includes("docs.google.com");
    if (isDrive) {
      return {
        name: isAr ? "رابط Google Drive" : "Google Drive Link",
        ext: "DRIVE",
        label: isAr ? "رابط خارجي على Google Drive" : "External link on Google Drive",
        isArchive: false,
        isZip: false,
        isVideo: false,
        isImage: false,
        isDrive: true,
      };
    }

    const clean = url.split("?")[0];
    const rawName = clean.substring(clean.lastIndexOf("/") + 1);
    const decodedName = decodeURIComponent(rawName) || url;
    const ext = rawName.split(".").pop()?.toLowerCase() || "";

    const ARCHIVE_EXTENSIONS = [
      "zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz", "tbz2", "zipx", "iso", "cab", "arj", "lzh", "z", "lzma"
    ];
    const isArchive = ARCHIVE_EXTENSIONS.includes(ext) || url.includes("/raw/upload/");
    const isVideo = ["mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv"].includes(ext) || url.includes("/video/upload/");
    const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext) || url.includes("/image/upload/");

    const extUpper = (ext || (isVideo ? "video" : isArchive ? "archive" : isImage ? "image" : "file")).toUpperCase();

    let label = isAr ? "ملف تسليم" : "Deliverable File";
    if (isVideo) {
      label = isAr ? `ملف فيديو عالي الجودة (${extUpper})` : `High-Quality Video (${extUpper})`;
    } else if (isArchive) {
      label = isAr ? `أرشيف مضغوط (${extUpper})` : `${extUpper} Compressed Archive`;
    } else if (isImage) {
      label = isAr ? `ملف صورة (${extUpper})` : `Image File (${extUpper})`;
    }

    return {
      name: decodedName,
      ext: extUpper,
      label,
      isArchive,
      isZip: isArchive,
      isVideo,
      isImage,
      isDrive: false,
    };
  } catch {
    return {
      name: url,
      ext: "FILE",
      label: isAr ? "ملف تسليم" : "Deliverable File",
      isArchive: false,
      isZip: false,
      isVideo: false,
      isImage: false,
      isDrive: false,
    };
  }
}

type Order = {
  id: string;
  project_title: string;
  project_description: string | null;
  total_amount: number;
  deposit_paid: number;
  remaining_amount: number;
  payment_status: string;
  receipt_url: string | null;
  delivery_type: string | null;
  delivery_files: string[];
  is_confirmed_by_admin: boolean;
  delivery_unlocked_at: string | null;
  delivery_expired: boolean;
  created_at: string;
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
        <h1 className="text-2xl font-bold">
          {isAr ? `مرحباً، ${profile.full_name || ""}` : `Welcome, ${profile.full_name || ""}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "لوحة التحكم — مشاريعك ومدفوعاتك" : "Your projects and payments dashboard"}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isAr ? "لا توجد مشاريع حالياً" : "No projects assigned yet"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} isAr={isAr} />
          ))}
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

    const update = () => {
      const diff = expiresAt - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    };

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

  if (days > 0) {
    return isAr
      ? `${days} يوم و ${hours} ساعة متبقية`
      : `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return isAr
      ? `${hours} ساعة و ${minutes} دقيقة متبقية`
      : `${hours}h ${minutes}m remaining`;
  }
  return isAr ? `${minutes} دقيقة متبقية` : `${minutes}m remaining`;
}

function OrderCard({ order, isAr }: { order: Order; isAr: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(order.receipt_url);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const remaining = useCountdown(order.delivery_unlocked_at);

  const handleReceiptUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, "echo/receipts");
      const supabase = createClient();
      const { error } = await supabase.from("client_orders").update({
        receipt_url: url,
        payment_status: "receipt_uploaded",
      }).eq("id", order.id);

      if (error) {
        console.error("Supabase receipt update error:", error);
        throw new Error(error.message);
      }

      setReceiptUrl(url);
      router.refresh();
    } catch (err: unknown) {
      console.error("Receipt upload error:", err);
      const msg = err instanceof Error ? err.message : "";
      alert(isAr ? `فشل رفع الإيصال: ${msg || "حاول مرة أخرى"}` : `Failed to upload receipt: ${msg || "Please try again"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReceipt = async () => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا الإيصال لرفع إيصال بديل؟" : "Are you sure you want to remove this receipt to upload a replacement?")) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const fallbackStatus = Number(order.deposit_paid) > 0 ? "deposit_paid" : "pending";
      const { error } = await supabase.from("client_orders").update({
        receipt_url: null,
        payment_status: fallbackStatus,
      }).eq("id", order.id);

      if (error) {
        console.error("Failed to delete receipt:", error);
        throw new Error(error.message);
      }

      setReceiptUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (err: unknown) {
      console.error("Delete receipt error:", err);
      alert(isAr ? "فشل حذف الإيصال، يرجى المحاولة مرة أخرى" : "Failed to delete receipt, please try again");
    } finally {
      setDeleting(false);
    }
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
            {order.project_description && (
              <p className="text-sm text-muted-foreground mt-1">{order.project_description}</p>
            )}
          </div>
          {isExpired ? (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
              <AlertTriangle size={12} /> {isAr ? "منتهي" : "Expired"}
            </Badge>
          ) : isLocked ? (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
              <Lock size={12} /> {isAr ? "مقفل" : "Locked"}
            </Badge>
          ) : (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
              <Unlock size={12} /> {isAr ? "مفتوح" : "Unlocked"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <CreditCard size={20} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-1">{isAr ? "الإجمالي" : "Total"}</p>
            <p className="text-lg font-bold">{Number(order.total_amount).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{isAr ? "ج.م" : "EGP"}</p>
          </div>
          <div className="rounded-xl bg-green-500/5 p-4 text-center">
            <Check size={20} className="mx-auto mb-2 text-green-500" />
            <p className="text-xs text-muted-foreground mb-1">{isAr ? "المدفوع" : "Paid"}</p>
            <p className="text-lg font-bold text-green-500">{Number(order.deposit_paid).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{isAr ? "ج.م" : "EGP"}</p>
          </div>
          <div className="rounded-xl bg-amber-500/5 p-4 text-center">
            <Clock size={20} className="mx-auto mb-2 text-amber-500" />
            <p className="text-xs text-muted-foreground mb-1">{isAr ? "المتبقي" : "Remaining"}</p>
            <p className="text-lg font-bold text-amber-500">{Number(order.remaining_amount).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{isAr ? "ج.م" : "EGP"}</p>
          </div>
        </div>

        {Number(order.remaining_amount) > 0 && order.payment_status !== "fully_paid" && (
          <>
            <Separator className="my-4" />
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <h4 className="font-medium text-sm mb-2">
                {isAr ? "ادفع المبلغ المتبقي" : "Pay Remaining Balance"}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {isAr
                  ? "حول المبلغ المتبقي عبر فودافون كاش أو إنستاباي ثم ارفع إيصال الدفع."
                  : "Transfer the remaining amount via Vodafone Cash or InstaPay, then upload your payment receipt."}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="rounded-lg bg-card p-3 border border-border/50">
                  <p className="font-medium">Vodafone Cash</p>
                  <p className="text-muted-foreground">010 XXXX XXXX</p>
                </div>
                <div className="rounded-lg bg-card p-3 border border-border/50">
                  <p className="font-medium">InstaPay</p>
                  <p className="text-muted-foreground">echo@instapay</p>
                </div>
              </div>

              {receiptUrl ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-amber-500">
                      <FileText size={20} className="shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">
                          {isAr ? "تم رفع إيصال الدفع" : "Payment receipt uploaded"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isAr ? "بانتظار مراجعة وتأكيد الإدارة" : "Awaiting admin review & verification"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                            <Eye size={14} /> {isAr ? "معاينة الإيصال" : "View Receipt"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{isAr ? "إيصال الدفع المرفق" : "Attached Payment Receipt"}</DialogTitle>
                          </DialogHeader>
                          {receiptUrl.toLowerCase().includes(".pdf") ? (
                            <div className="py-8 text-center space-y-4">
                              <FileText size={48} className="mx-auto text-muted-foreground" />
                              <p className="text-sm font-medium">{isAr ? "مستند PDF" : "PDF Document"}</p>
                              <Button asChild size="sm" className="gap-1.5">
                                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink size={14} /> {isAr ? "فتح الإيصال في نافذة جديدة" : "Open in New Tab"}
                                </a>
                              </Button>
                            </div>
                          ) : (
                            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                              <Image src={receiptUrl} alt="Receipt Preview" fill className="object-contain" sizes="500px" />
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleting}
                        className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={handleDeleteReceipt}
                      >
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {isAr ? "حذف وتغيير الإيصال" : "Remove & Replace"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label className="text-sm">{isAr ? "ارفع إيصال الدفع" : "Upload Payment Receipt"}</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReceiptUpload(file);
                    }}
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" />
                      {isAr ? "جاري الرفع..." : "Uploading..."}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <Separator className="my-4" />

        <div>
          <h4 className="font-medium text-sm mb-3">
            {isAr ? "ملفات التسليم" : "Deliverables"}
          </h4>

          {isExpired ? (
            <div className="rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-6 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3 text-red-500/50" />
              <p className="text-sm font-medium text-red-500">
                {isAr
                  ? "انتهت صلاحية الملفات. تم تسليم المشروع بنجاح."
                  : "Files have expired. Project was delivered successfully."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "تم حذف الملفات تلقائياً بعد انتهاء فترة الـ 7 أيام."
                  : "Files were automatically removed after the 7-day download window."}
              </p>
            </div>
          ) : isLocked ? (
            <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center">
              <Lock size={32} className="mx-auto mb-3 text-amber-500/50" />
              <p className="text-sm font-medium text-amber-500">
                {isAr
                  ? "جاري التحقق من الدفع من قبل الإدارة."
                  : "Payment verification in progress by admin."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "ستتمكن من الوصول للملفات بعد تأكيد الدفع."
                  : "You will be able to access files once payment is confirmed."}
              </p>
            </div>
          ) : hasDelivery ? (
            <div>
              {remaining !== null && remaining > 0 && (
                <div className={`flex items-center gap-2 text-sm mb-3 p-3 rounded-lg ${isUrgent ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
                  <Timer size={16} />
                  <span className="font-medium">
                    {formatCountdown(remaining, isAr)}
                  </span>
                  <span className="text-xs opacity-75">
                    {isAr ? "— حمّل الملفات قبل انتهاء المهلة" : "— download before time runs out"}
                  </span>
                </div>
              )}
              <div className="grid gap-2.5">
                {order.delivery_files.map((url, i) => {
                  const meta = getDeliveryFileMeta(url, isAr);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:border-primary/40 hover:bg-muted/20 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            meta.isVideo
                              ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                              : meta.isZip
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : meta.isDrive
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : meta.isImage
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {meta.isVideo ? (
                            <FileVideo size={20} />
                          ) : meta.isZip ? (
                            <FileArchive size={20} />
                          ) : meta.isDrive ? (
                            <ExternalLink size={20} />
                          ) : meta.isImage ? (
                            <FileImage size={20} />
                          ) : (
                            <Download size={20} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className="text-sm font-semibold truncate group-hover:text-primary transition-colors text-foreground"
                              title={meta.name}
                            >
                              {meta.name}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono uppercase px-1.5 py-0 h-4 ${
                                meta.isVideo
                                  ? "border-purple-500/30 text-purple-500"
                                  : meta.isZip
                                  ? "border-amber-500/30 text-amber-500"
                                  : meta.isDrive
                                  ? "border-blue-500/30 text-blue-500"
                                  : "border-muted-foreground/30 text-muted-foreground"
                              }`}
                            >
                              {meta.ext}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {meta.label}
                          </p>
                        </div>
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={!meta.isDrive}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex-shrink-0 shadow-sm hover:shadow cursor-pointer"
                      >
                        {meta.isDrive ? (
                          <>
                            <ExternalLink size={13} />
                            <span>{isAr ? "فتح الرابط" : "Open Link"}</span>
                          </>
                        ) : meta.isArchive ? (
                          <>
                            <Download size={13} />
                            <span>{isAr ? `تحميل (${meta.ext})` : `Download (${meta.ext})`}</span>
                          </>
                        ) : meta.isVideo ? (
                          <>
                            <Download size={13} />
                            <span>{isAr ? `تحميل الفيديو (${meta.ext})` : `Download Video (${meta.ext})`}</span>
                          </>
                        ) : (
                          <>
                            <Download size={13} />
                            <span>{isAr ? `تحميل (${meta.ext})` : `Download (${meta.ext})`}</span>
                          </>
                        )}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-6 text-center text-muted-foreground text-sm">
              {isAr ? "لم يتم إرفاق ملفات بعد" : "No deliverables attached yet"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
