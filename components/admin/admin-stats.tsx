"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, ShoppingCart, Users, DollarSign, HardDrive, Trash2, Loader2 } from "lucide-react";

type Stats = {
  portfolioCount: number;
  ordersCount: number;
  clientsCount: number;
  totalRevenue: number;
  pendingReceipts: number;
};

type CloudinaryUsage = {
  used: number;
  limit: number;
  usedFormatted: string;
  limitFormatted: string;
  percentage: number;
  resources: number;
};

type OrphanedItem = { public_id: string; url: string; type: string };

export function AdminStats({ stats }: { stats: Stats }) {
  const { isAr } = useI18n();
  const [usage, setUsage] = useState<CloudinaryUsage | null>(null);
  const [orphaned, setOrphaned] = useState<OrphanedItem[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    fetch("/api/cloudinary-usage")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setUsage(data); })
      .catch(() => {});
  }, []);

  const scanOrphaned = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/cloudinary-cleanup");
      const data = await res.json();
      setOrphaned(data.orphaned || []);
    } catch {
      alert(isAr ? "فشل الفحص" : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const deleteOrphaned = async () => {
    if (!orphaned?.length) return;
    if (!confirm(isAr ? `حذف ${orphaned.length} ملف(ات) غير مستخدمة؟` : `Delete ${orphaned.length} orphaned file(s)?`)) return;
    setCleaning(true);
    try {
      await fetch("/api/cloudinary-cleanup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orphaned.map((o) => ({ public_id: o.public_id, type: o.type })),
        }),
      });
      setOrphaned([]);
      const res = await fetch("/api/cloudinary-usage");
      const data = await res.json();
      if (!data.error) setUsage(data);
    } catch {
      alert(isAr ? "فشل الحذف" : "Cleanup failed");
    } finally {
      setCleaning(false);
    }
  };

  const cards = [
    { labelEn: "Portfolio Items", labelAr: "عناصر الأعمال", value: stats.portfolioCount, icon: Image },
    { labelEn: "Total Orders", labelAr: "إجمالي الطلبات", value: stats.ordersCount, icon: ShoppingCart },
    { labelEn: "Clients", labelAr: "العملاء", value: stats.clientsCount, icon: Users },
    {
      labelEn: "Total Revenue", labelAr: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toLocaleString()} ${isAr ? "ج.م" : "EGP"}`,
      icon: DollarSign,
    },
  ];

  const barColor = usage
    ? usage.percentage > 80 ? "bg-red-500" : usage.percentage > 60 ? "bg-amber-500" : "bg-green-500"
    : "bg-muted";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isAr ? "لوحة التحكم" : "Admin Dashboard"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.labelEn}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isAr ? card.labelAr : card.labelEn}
              </CardTitle>
              <card.icon size={18} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.pendingReceipts > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5 mb-6">
          <CardContent className="pt-6">
            <p className="text-sm font-medium">
              <span className="text-amber-500 font-bold">{stats.pendingReceipts}</span>{" "}
              {isAr ? "إيصال(ات) دفع بانتظار المراجعة" : "payment receipt(s) pending review"}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {isAr ? "مساحة التخزين — Cloudinary" : "Storage — Cloudinary"}
          </CardTitle>
          <HardDrive size={18} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {usage ? (
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-bold">{usage.usedFormatted}</span>
                <span className="text-sm text-muted-foreground">/ {usage.limitFormatted}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {usage.percentage}% {isAr ? "مستخدم" : "used"} &middot; {usage.resources} {isAr ? "ملف" : "files"}
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {isAr ? "جاري التحميل..." : "Loading..."}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {isAr ? "تنظيف الملفات غير المستخدمة" : "Orphaned Media Cleanup"}
          </CardTitle>
          <Trash2 size={18} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isAr
              ? "ابحث عن الملفات في Cloudinary غير المرتبطة بأي عنصر في الموقع واحذفها."
              : "Find files on Cloudinary not referenced by any item on the site and delete them."}
          </p>

          {orphaned === null ? (
            <Button
              variant="outline"
              onClick={scanOrphaned}
              disabled={scanning}
              className="gap-2 cursor-pointer"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <HardDrive size={14} />}
              {scanning ? (isAr ? "جاري الفحص..." : "Scanning...") : (isAr ? "فحص الملفات" : "Scan Files")}
            </Button>
          ) : orphaned.length === 0 ? (
            <div className="text-sm text-green-500 font-medium">
              {isAr ? "لا توجد ملفات غير مستخدمة." : "No orphaned files found."}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-3">
                {isAr
                  ? `تم العثور على ${orphaned.length} ملف(ات) غير مستخدمة`
                  : `Found ${orphaned.length} orphaned file(s)`}
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 divide-y divide-border/30 mb-4">
                {orphaned.map((item) => (
                  <div key={item.public_id} className="px-3 py-2 text-xs">
                    <span className="font-mono text-muted-foreground">{item.public_id}</span>
                    <span className="ms-2 text-muted-foreground/60">{item.type}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteOrphaned}
                  disabled={cleaning}
                  className="gap-2 cursor-pointer"
                >
                  {cleaning ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {cleaning ? (isAr ? "جاري الحذف..." : "Deleting...") : (isAr ? "حذف الكل" : "Delete All")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrphaned(null)}
                  className="cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
