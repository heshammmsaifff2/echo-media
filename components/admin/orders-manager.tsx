"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Check, Loader2, ExternalLink, Lock, Unlock, Timer, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  const [deliveryForm, setDeliveryForm] = useState({
    delivery_type: "direct_files" as string,
    delivery_url: "",
  });

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

  const confirmPayment = async (orderId: string) => {
    if (!confirm(isAr ? "تأكيد الدفع وفتح الملفات للعميل؟" : "Confirm this payment and unlock deliverables for the client?")) return;
    const supabase = createClient();
    await supabase.from("client_orders").update({
      is_confirmed_by_admin: true,
      payment_status: "fully_paid",
      delivery_unlocked_at: new Date().toISOString(),
    }).eq("id", orderId);
    setOrders(orders.map((o) => o.id === orderId ? { ...o, is_confirmed_by_admin: true, payment_status: "fully_paid", delivery_unlocked_at: new Date().toISOString() } : o));
  };

  const saveDelivery = async () => {
    if (!deliveryDialog) return;
    setLoading(true);
    const supabase = createClient();
    const files = deliveryForm.delivery_url
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    await supabase.from("client_orders").update({
      delivery_type: deliveryForm.delivery_type,
      delivery_files: files,
    }).eq("id", deliveryDialog.id);
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

                <div className="flex flex-wrap gap-2">
                  {order.receipt_url && (
                    <Dialog open={receiptView === order.id} onOpenChange={(open) => setReceiptView(open ? order.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                          <Eye size={14} /> {isAr ? "عرض الإيصال" : "View Receipt"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>{isAr ? "إيصال الدفع" : "Payment Receipt"}</DialogTitle></DialogHeader>
                        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                          <Image src={order.receipt_url} alt="Receipt" fill className="object-contain" sizes="500px" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {order.payment_status === "receipt_uploaded" && !order.is_confirmed_by_admin && (
                    <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 cursor-pointer" onClick={() => confirmPayment(order.id)}>
                      <Check size={14} /> {isAr ? "تأكيد الدفع" : "Confirm Payment"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 cursor-pointer"
                    onClick={() => {
                      setDeliveryForm({
                        delivery_type: order.delivery_type || "direct_files",
                        delivery_url: (order.delivery_files || []).join("\n"),
                      });
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
        <DialogContent>
          <DialogHeader><DialogTitle>{isAr ? "إدارة التسليم" : "Manage Delivery"} — {deliveryDialog?.project_title}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{isAr ? "نوع التسليم" : "Delivery Type"}</Label>
              <Select value={deliveryForm.delivery_type} onValueChange={(v) => setDeliveryForm({ ...deliveryForm, delivery_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_files">{isAr ? "ملفات مباشرة (Cloudinary)" : "Direct Files (Cloudinary)"}</SelectItem>
                  <SelectItem value="google_drive_link">{isAr ? "رابط Google Drive" : "Google Drive Link"}</SelectItem>
                  <SelectItem value="zip_archive">{isAr ? "ملف مضغوط ZIP" : "ZIP Archive"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{isAr ? "روابط الملفات (رابط في كل سطر)" : "File URLs (one per line)"}</Label>
              <Textarea
                value={deliveryForm.delivery_url}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_url: e.target.value })}
                rows={4}
                placeholder="https://drive.google.com/... or https://res.cloudinary.com/..."
                dir="ltr"
              />
            </div>
            <Button onClick={saveDelivery} disabled={loading} className="cursor-pointer">
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {isAr ? "حفظ التسليم" : "Save Delivery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
