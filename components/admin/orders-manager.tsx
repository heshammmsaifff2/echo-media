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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Eye, Check, Loader2, ExternalLink, Lock, Unlock, Timer, AlertTriangle,
  Upload, FileArchive, FileVideo, FileImage, FileText, Trash2, Link as LinkIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function getDeliveryFileMeta(url: string, isAr: boolean) {
  try {
    const isDrive = url.includes("drive.google.com") || url.includes("docs.google.com");
    const clean = url.split("?")[0];
    const name = clean.substring(clean.lastIndexOf("/") + 1);
    const ext = name.split(".").pop()?.toLowerCase() || "";

    const ARCHIVE_EXTENSIONS = [
      "zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz", "tbz2", "zipx", "iso", "cab", "arj", "lzh", "z", "lzma"
    ];
    const isArchive = ARCHIVE_EXTENSIONS.includes(ext) || url.includes("/raw/upload/");
    const isVideo = ["mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv"].includes(ext) || url.includes("/video/upload/");
    const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext) || url.includes("/image/upload/");

    const extUpper = (ext || (isVideo ? "video" : isArchive ? "archive" : isImage ? "image" : "file")).toUpperCase();

    let label = isAr ? "ملف" : "File";
    if (isDrive) label = isAr ? "رابط Google Drive" : "Google Drive Link";
    else if (isArchive) label = isAr ? `أرشيف مضغوط (${extUpper})` : `${extUpper} Compressed Archive`;
    else if (isVideo) label = isAr ? `ملف فيديو (${extUpper})` : `Video File (${extUpper})`;
    else if (isImage) label = isAr ? `صورة (${extUpper})` : `Image (${extUpper})`;

    return {
      name: isDrive ? (isAr ? "رابط Google Drive" : "Google Drive Link") : (decodeURIComponent(name) || url),
      ext: isDrive ? "DRIVE" : extUpper,
      label,
      isArchive,
      isZip: isArchive,
      isVideo,
      isImage,
      isDrive,
    };
  } catch {
    return { name: url, ext: "", label: isAr ? "ملف" : "File", isArchive: false, isZip: false, isVideo: false, isImage: false, isDrive: false };
  }
}

type Order = {
  id: string;
  client_id: string;
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
  profiles: { full_name: string; email: string } | null;
};

type Client = { id: string; full_name: string; email: string };

/** Clients get a 7-day window to download deliverables once payment is confirmed. */
function deliveryRemaining(unlockedAt: string, isAr: boolean) {
  const ms = new Date(unlockedAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now();
  if (ms <= 0) return isAr ? "انتهت المهلة" : "Window closed";

  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return days > 0
    ? (isAr ? `متاح للعميل: ${days} يوم و ${hours} ساعة` : `Client access: ${days}d ${hours}h left`)
    : (isAr ? `متاح للعميل: ${hours} ساعة` : `Client access: ${hours}h left`);
}

export function OrdersManager({ initialOrders, clients }: { initialOrders: Order[]; clients: Client[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [createOpen, setCreateOpen] = useState(false);
  const [receiptView, setReceiptView] = useState<string | null>(null);
  const [deliveryDialog, setDeliveryDialog] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAr } = useI18n();

  const [newOrder, setNewOrder] = useState({
    client_id: "", project_title: "", project_description: "",
    total_amount: "", deposit_paid: "",
  });

  const [deliveryForm, setDeliveryForm] = useState<{
    delivery_type: string;
    files: string[];
    manualUrl: string;
  }>({
    delivery_type: "direct_files",
    files: [],
    manualUrl: "",
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const handleDeliveryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadToCloudinary(file, "echo/deliveries");
        uploadedUrls.push(res.url);
      }
      setDeliveryForm((prev) => ({
        ...prev,
        files: [...prev.files, ...uploadedUrls],
      }));
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : (isAr ? "فشل رفع الملفات" : "Failed to upload files");
      alert(msg);
    } finally {
      setUploadingFiles(false);
      e.target.value = "";
    }
  };

  const removeDeliveryFile = (index: number) => {
    setDeliveryForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const addManualUrl = () => {
    const trimmed = deliveryForm.manualUrl.trim();
    if (!trimmed) return;
    setDeliveryForm((prev) => ({
      ...prev,
      files: [...prev.files, trimmed],
      manualUrl: "",
    }));
  };

  const handleCreateOrder = async () => {
    if (!newOrder.client_id || !newOrder.project_title) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("client_orders").insert({
      client_id: newOrder.client_id,
      project_title: newOrder.project_title,
      project_description: newOrder.project_description || null,
      total_amount: parseFloat(newOrder.total_amount) || 0,
      deposit_paid: parseFloat(newOrder.deposit_paid) || 0,
    });
    setCreateOpen(false);
    setNewOrder({ client_id: "", project_title: "", project_description: "", total_amount: "", deposit_paid: "" });
    setLoading(false);
    router.refresh();
  };

  const confirmPayment = async (orderId: string, isCash: boolean = false) => {
    const confirmMsg = isCash
      ? (isAr
          ? "تأكيد استلام المبلغ بالكامل (كاش / يدوي) وفتح ملفات التسليم للعميل فوراً؟"
          : "Confirm full payment received (cash/direct) and unlock deliverables for the client immediately?")
      : (isAr
          ? "تأكيد صحة الإيصال وفتح ملفات التسليم للعميل؟"
          : "Confirm this receipt and unlock deliverables for the client?");

    if (!confirm(confirmMsg)) return;

    const supabase = createClient();
    const unlockTime = new Date().toISOString();
    const { error } = await supabase.from("client_orders").update({
      is_confirmed_by_admin: true,
      payment_status: "fully_paid",
      delivery_unlocked_at: unlockTime,
    }).eq("id", orderId);

    if (error) {
      console.error("Confirm payment error:", error);
      alert(isAr ? "فشل تأكيد الدفع، يرجى المحاولة مرة أخرى" : "Failed to confirm payment, please try again");
      return;
    }

    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              is_confirmed_by_admin: true,
              payment_status: "fully_paid",
              delivery_unlocked_at: unlockTime,
            }
          : o
      )
    );
    router.refresh();
  };

  const saveDelivery = async () => {
    if (!deliveryDialog) return;
    setLoading(true);
    const supabase = createClient();
    
    const finalFiles = [...deliveryForm.files];
    if (deliveryForm.manualUrl.trim() && !finalFiles.includes(deliveryForm.manualUrl.trim())) {
      finalFiles.push(deliveryForm.manualUrl.trim());
    }

    let determinedType = deliveryForm.delivery_type;
    const hasDrive = finalFiles.some((f) => f.includes("drive.google.com") || f.includes("docs.google.com"));
    
    if (deliveryForm.delivery_type === "google_drive_link" && !hasDrive && finalFiles.length > 0) {
      determinedType = "direct_files";
    } else if (deliveryForm.delivery_type === "direct_files" && hasDrive && finalFiles.length === 1) {
      determinedType = "google_drive_link";
    }

    await supabase.from("client_orders").update({
      delivery_type: determinedType,
      delivery_files: finalFiles,
    }).eq("id", deliveryDialog.id);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === deliveryDialog.id
          ? { ...o, delivery_type: determinedType, delivery_files: finalFiles }
          : o
      )
    );

    setDeliveryDialog(null);
    setLoading(false);
    router.refresh();
  };

  const statusBadge = (status: string, confirmed: boolean) => {
    if (confirmed) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{isAr ? "مؤكد" : "Confirmed"}</Badge>;
    if (status === "receipt_uploaded") return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{isAr ? "إيصال بانتظار المراجعة" : "Receipt Pending"}</Badge>;
    return <Badge variant="secondary">{isAr ? "عربون مدفوع" : "Deposit Paid"}</Badge>;
  };

  const currency = isAr ? "ج.م" : "EGP";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isAr ? "طلبات العملاء" : "Client Orders"}</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 cursor-pointer"><Plus size={16} /> {isAr ? "طلب جديد" : "New Order"}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isAr ? "إنشاء طلب جديد" : "Create New Order"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{isAr ? "العميل" : "Client"}</Label>
                <Select value={newOrder.client_id} onValueChange={(v) => setNewOrder({ ...newOrder, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder={isAr ? "اختر عميل" : "Select client"} /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{isAr ? "عنوان المشروع" : "Project Title"}</Label>
                <Input value={newOrder.project_title} onChange={(e) => setNewOrder({ ...newOrder, project_title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{isAr ? "الوصف (اختياري)" : "Description (optional)"}</Label>
                <Textarea value={newOrder.project_description} onChange={(e) => setNewOrder({ ...newOrder, project_description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{isAr ? `المبلغ الكلي (${currency})` : `Total Amount (${currency})`}</Label>
                  <Input type="number" value={newOrder.total_amount} onChange={(e) => setNewOrder({ ...newOrder, total_amount: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>{isAr ? `العربون المدفوع (${currency})` : `Deposit Paid (${currency})`}</Label>
                  <Input type="number" value={newOrder.deposit_paid} onChange={(e) => setNewOrder({ ...newOrder, deposit_paid: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleCreateOrder} disabled={loading} className="cursor-pointer">
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {isAr ? "إنشاء الطلب" : "Create Order"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {orders.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{isAr ? "لا توجد طلبات بعد" : "No orders yet."}</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{order.project_title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {order.profiles?.full_name || order.profiles?.email || (isAr ? "عميل غير معروف" : "Unknown client")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(order.payment_status, order.is_confirmed_by_admin)}
                    {order.is_confirmed_by_admin ? <Unlock size={14} className="text-green-500" /> : <Lock size={14} className="text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">{isAr ? "الإجمالي" : "Total"}</p>
                    <p className="font-semibold">{Number(order.total_amount).toLocaleString()} {currency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{isAr ? "العربون" : "Deposit"}</p>
                    <p className="font-semibold">{Number(order.deposit_paid).toLocaleString()} {currency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{isAr ? "المتبقي" : "Remaining"}</p>
                    <p className="font-semibold text-amber-500">{Number(order.remaining_amount).toLocaleString()} {currency}</p>
                  </div>
                </div>

                {order.delivery_unlocked_at && (
                  <div className="mb-4 text-sm">
                    {order.delivery_expired ? (
                      <span className="inline-flex items-center gap-1.5 text-red-500">
                        <AlertTriangle size={14} />
                        {isAr ? "انتهت صلاحية الملفات وتم حذفها" : "Delivery expired — files removed"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-blue-500">
                        <Timer size={14} />
                        {deliveryRemaining(order.delivery_unlocked_at, isAr)}
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4 text-xs flex items-center gap-2">
                  {order.delivery_files && order.delivery_files.length > 0 ? (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 py-1">
                      <FileText size={12} />
                      {isAr
                        ? `تم إرفاق ${order.delivery_files.length} ملف(ات) للعميل`
                        : `${order.delivery_files.length} deliverable file(s) attached`}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground italic">
                      {isAr ? "لم يتم إرفاق ملفات تسليم بعد" : "No deliverables attached yet"}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {order.receipt_url && (
                    <Dialog open={receiptView === order.id} onOpenChange={(open) => setReceiptView(open ? order.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                          <Eye size={14} /> {isAr ? "عرض الإيصال" : "View Receipt"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>{isAr ? "إيصال الدفع" : "Payment Receipt"}</DialogTitle></DialogHeader>
                        {order.receipt_url.toLowerCase().includes(".pdf") ? (
                          <div className="py-8 text-center space-y-4">
                            <FileText size={48} className="mx-auto text-muted-foreground" />
                            <p className="text-sm font-medium">{isAr ? "مستند PDF" : "PDF Document"}</p>
                            <Button asChild size="sm" className="gap-1.5">
                              <a href={order.receipt_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={14} /> {isAr ? "فتح الإيصال في نافذة جديدة" : "Open in New Tab"}
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                            <Image src={order.receipt_url} alt="Receipt" fill className="object-contain" sizes="500px" />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}

                  {!order.is_confirmed_by_admin ? (
                    order.receipt_url ? (
                      <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white cursor-pointer" onClick={() => confirmPayment(order.id, false)}>
                        <Check size={14} /> {isAr ? "تأكيد الإيصال وفتح الملفات" : "Confirm Receipt & Unlock"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5 border-emerald-600/50 text-emerald-500 hover:bg-emerald-600/10 hover:text-emerald-400 cursor-pointer" onClick={() => confirmPayment(order.id, true)}>
                        <Check size={14} /> {isAr ? "تأكيد استلام كاش (فتح الملفات)" : "Confirm Cash Payment"}
                      </Button>
                    )
                  ) : (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 py-1.5 px-2.5 text-xs font-medium">
                      <Check size={12} /> {isAr ? "تم الدفع وتأكيد الملفات" : "Payment Confirmed & Files Unlocked"}
                    </Badge>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 cursor-pointer"
                    onClick={() => {
                      setDeliveryForm({
                        delivery_type: order.delivery_type === "google_drive_link" ? "google_drive_link" : "direct_files",
                        files: order.delivery_files || [],
                        manualUrl: "",
                      });
                      setShowManualInput(false);
                      setDeliveryDialog(order);
                    }}
                  >
                    <ExternalLink size={14} /> {isAr ? "إدارة التسليم" : "Manage Delivery"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deliveryDialog} onOpenChange={(open) => !open && setDeliveryDialog(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload size={18} className="text-primary" />
              {isAr ? "إدارة تسليم الشغل" : "Manage Deliverables"} — {deliveryDialog?.project_title}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-3">
            {/* Delivery Type Selection */}
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">{isAr ? "نوع وطريقة التسليم" : "Delivery Method"}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryForm((prev) => ({ ...prev, delivery_type: "direct_files" }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-start transition-all cursor-pointer ${
                    deliveryForm.delivery_type === "direct_files"
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40 text-foreground"
                      : "border-border/60 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    deliveryForm.delivery_type === "direct_files" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <FileVideo size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">
                      {isAr ? "ملفات فيديو وصور مباشرة" : "Direct Videos & Images"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isAr ? "رفع مباشر عبر Cloudinary" : "Direct upload via Cloudinary"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryForm((prev) => ({ ...prev, delivery_type: "google_drive_link" }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-start transition-all cursor-pointer ${
                    deliveryForm.delivery_type === "google_drive_link"
                      ? "border-blue-500 bg-blue-500/10 shadow-sm ring-1 ring-blue-500/40 text-foreground"
                      : "border-border/60 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    deliveryForm.delivery_type === "google_drive_link" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <ExternalLink size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">
                      {isAr ? "رابط Google Drive" : "Google Drive Link"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isAr ? "للمشاريع والملفات المضغوطة" : "For projects & archives"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Currently Attached Files Section */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  {isAr ? "الملفات المرفوعة للعميل حالياً" : "Currently Attached Deliverables"}
                </Label>
                <Badge variant="secondary" className="text-xs">
                  {deliveryForm.files.length} {isAr ? "ملف(ات)" : "file(s)"}
                </Badge>
              </div>

              {deliveryForm.files.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                  {isAr ? "لم يتم إرفاق أي ملفات لهذا المشروع حتى الآن" : "No files attached for this project yet"}
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {deliveryForm.files.map((url, idx) => {
                    const meta = getDeliveryFileMeta(url, isAr);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            {meta.isZip ? (
                              <FileArchive size={16} />
                            ) : meta.isVideo ? (
                              <FileVideo size={16} />
                            ) : meta.isImage ? (
                              <FileImage size={16} />
                            ) : meta.isDrive ? (
                              <ExternalLink size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate" title={meta.name}>
                              {meta.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{meta.label}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2.5 py-1 rounded bg-primary/5 font-medium"
                          >
                            <Eye size={12} />
                            {isAr ? "معاينة" : "Open"}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => removeDeliveryFile(idx)}
                            title={isAr ? "حذف الملف" : "Remove file"}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upload or Add Files Section */}
            <div className="grid gap-2 pt-2 border-t">
              <Label className="text-sm font-semibold">
                {isAr ? "إرفاق وإضافة ملفات جديدة" : "Attach & Add New Files"}
              </Label>

              {/* Direct Files Uploader */}
              {deliveryForm.delivery_type === "direct_files" && (
                <div className="border border-dashed border-primary/30 rounded-xl p-4 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-1">
                    <span>{isAr ? "اختر ملفات فيديو أو صور من جهازك لرفعها إلى Cloudinary" : "Select video or image files to upload to Cloudinary"}</span>
                    <span className="font-mono text-[11px] text-primary">MP4, MOV, WEBM, JPG, PNG...</span>
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept="video/*,image/*,.mp4,.mov,.avi,.mkv,.webm,.jpg,.jpeg,.png,.webp"
                    disabled={uploadingFiles || loading}
                    onChange={handleDeliveryFileUpload}
                    className="cursor-pointer bg-background"
                  />
                  {uploadingFiles && (
                    <p className="text-xs text-blue-500 flex items-center gap-1.5 pt-1 font-medium">
                      <Loader2 size={13} className="animate-spin" />
                      {isAr ? "جاري رفع الملفات إلى Cloudinary..." : "Uploading files to Cloudinary..."}
                    </p>
                  )}
                </div>
              )}

              {/* Google Drive Link Input */}
              {deliveryForm.delivery_type === "google_drive_link" && (
                <div className="space-y-2 p-3 border rounded-xl bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <Label className="text-xs text-muted-foreground">
                      {isAr ? "أدخل رابط Google Drive للمشروع أو الملف المضغوط" : "Enter Google Drive link for project or archive"}
                    </Label>
                    <span className="text-[11px] text-primary font-medium">
                      {isAr ? "موصى به للملفات المضغوطة والمشاريع الكبيرة" : "Recommended for archives & projects"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={deliveryForm.manualUrl}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, manualUrl: e.target.value })}
                      placeholder="https://drive.google.com/drive/folders/..."
                      dir="ltr"
                      className="bg-background"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addManualUrl}
                      disabled={!deliveryForm.manualUrl.trim()}
                      className="cursor-pointer"
                    >
                      {isAr ? "إضافة" : "Add"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Optional Manual URL Fallback for direct/zip */}
              {deliveryForm.delivery_type !== "google_drive_link" && (
                <div className="pt-1">
                  {!showManualInput ? (
                    <button
                      type="button"
                      onClick={() => setShowManualInput(true)}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <LinkIcon size={12} />
                      {isAr ? "هل تريد إضافة رابط خارجي يدوياً؟" : "Want to add an external link manually?"}
                    </button>
                  ) : (
                    <div className="p-3 border rounded-lg bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">
                          {isAr ? "إضافة رابط خارجي يدوياً" : "Add external link manually"}
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowManualInput(false)}
                          className="text-xs text-muted-foreground hover:underline cursor-pointer"
                        >
                          {isAr ? "إغلاق" : "Close"}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={deliveryForm.manualUrl}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, manualUrl: e.target.value })}
                          placeholder="https://..."
                          dir="ltr"
                          className="bg-background text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={addManualUrl}
                          disabled={!deliveryForm.manualUrl.trim()}
                          className="cursor-pointer"
                        >
                          {isAr ? "إضافة" : "Add"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setDeliveryDialog(null)} disabled={loading} className="cursor-pointer">
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={saveDelivery} disabled={loading || uploadingFiles} className="cursor-pointer">
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {isAr ? "حفظ التسليم" : "Save Delivery"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
