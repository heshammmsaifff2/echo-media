"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/upload";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Lock, Unlock, Loader2, Check, Download,
  ExternalLink, FileText, CreditCard, Clock, Timer, AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [uploaded, setUploaded] = useState(false);
  const router = useRouter();
  const remaining = useCountdown(order.delivery_unlocked_at);

  const handleReceiptUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, "echo/receipts");
      const supabase = createClient();
      await supabase.from("client_orders").update({
        receipt_url: url,
        payment_status: "receipt_uploaded",
      }).eq("id", order.id);
      setUploaded(true);
      router.refresh();
    } catch {
      alert(isAr ? "فشل رفع الإيصال" : "Failed to upload receipt");
    } finally {
      setUploading(false);
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

              {order.payment_status === "receipt_uploaded" || uploaded ? (
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <FileText size={16} />
                  {isAr ? "تم رفع الإيصال — بانتظار تأكيد الإدارة" : "Receipt uploaded — awaiting admin verification"}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label className="text-sm">{isAr ? "ارفع إيصال الدفع" : "Upload Payment Receipt"}</Label>
                  <Input
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
              <div className="grid gap-2">
                {order.delivery_files.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 hover:border-blue-500/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      {order.delivery_type === "google_drive_link" ? (
                        <ExternalLink size={18} className="text-blue-500" />
                      ) : (
                        <Download size={18} className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-blue-500 transition-colors">
                        {order.delivery_type === "google_drive_link"
                          ? (isAr ? "رابط Google Drive" : "Google Drive Link")
                          : `${isAr ? "ملف" : "File"} ${i + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{url}</p>
                    </div>
                  </a>
                ))}
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
