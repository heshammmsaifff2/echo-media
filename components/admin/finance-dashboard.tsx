"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { type Payment, confirmedTotal, remainingBalance, isFullyPaid } from "@/lib/payments";
import { Wallet, Coins, Clock, Banknote, Receipt, TrendingUp } from "lucide-react";

export type FinanceOrder = {
  id: string;
  project_title: string;
  total_amount: number;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
  order_payments: Payment[];
};

type OrderStatus = "fully_paid" | "partial" | "unpaid";
type Txn = {
  id: string;
  amount: number;
  date: string;
  isCash: boolean;
  orderTitle: string;
  clientName: string;
  status: OrderStatus;
};

type DatePreset = "all" | "month" | "30d" | "year" | "custom";
type StatusFilter = "all" | OrderStatus;
type MethodFilter = "all" | "cash" | "receipt";

function orderStatus(o: FinanceOrder): OrderStatus {
  const payments = o.order_payments || [];
  if (isFullyPaid(o.total_amount, payments)) return "fully_paid";
  if (confirmedTotal(payments) > 0) return "partial";
  return "unpaid";
}

export function FinanceDashboard({ orders }: { orders: FinanceOrder[] }) {
  const { isAr } = useI18n();
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const currency = isAr ? "ج.م" : "EGP";
  const fmt = (n: number) => `${Number(n || 0).toLocaleString()} ${currency}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(isAr ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  const [preset, setPreset] = useState<DatePreset>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [method, setMethod] = useState<MethodFilter>("all");

  // Every confirmed payment across all orders — the actual money that came in.
  const allTxns = useMemo<Txn[]>(() => {
    const list: Txn[] = [];
    for (const o of orders) {
      const st = orderStatus(o);
      for (const p of o.order_payments || []) {
        if (!p.is_confirmed) continue;
        list.push({
          id: p.id,
          amount: Number(p.amount || 0),
          date: p.confirmed_at || p.created_at,
          isCash: !!p.is_cash,
          orderTitle: o.project_title,
          clientName: o.profiles?.full_name || o.profiles?.email || t("Unknown", "غير معروف"),
          status: st,
        });
      }
    }
    return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const [rangeStart, rangeEnd] = useMemo<[Date | null, Date | null]>(() => {
    const now = new Date();
    if (preset === "month") return [new Date(now.getFullYear(), now.getMonth(), 1), null];
    if (preset === "year") return [new Date(now.getFullYear(), 0, 1), null];
    if (preset === "30d") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return [d, null];
    }
    if (preset === "custom") {
      return [from ? new Date(from + "T00:00:00") : null, to ? new Date(to + "T23:59:59") : null];
    }
    return [null, null];
  }, [preset, from, to]);

  const txns = useMemo(() => {
    return allTxns.filter((x) => {
      const d = new Date(x.date);
      if (rangeStart && d < rangeStart) return false;
      if (rangeEnd && d > rangeEnd) return false;
      if (status !== "all" && x.status !== status) return false;
      if (method === "cash" && !x.isCash) return false;
      if (method === "receipt" && x.isCash) return false;
      return true;
    });
  }, [allTxns, rangeStart, rangeEnd, status, method]);

  const collected = txns.reduce((s, x) => s + x.amount, 0);
  const cashTotal = txns.filter((x) => x.isCash).reduce((s, x) => s + x.amount, 0);
  const receiptTotal = collected - cashTotal;

  const outstanding = orders.reduce((s, o) => s + remainingBalance(o.total_amount, o.order_payments || []), 0);
  const totalValue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  // Monthly breakdown of the filtered income.
  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const x of txns) {
      const d = new Date(x.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + x.amount);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 6);
  }, [txns]);
  const monthLabel = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(isAr ? "ar-EG" : "en-GB", { month: "long", year: "numeric" });
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
      active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
    }`;

  const datePresets: { key: DatePreset; label: string }[] = [
    { key: "all", label: t("All time", "كل الفترات") },
    { key: "month", label: t("This month", "هذا الشهر") },
    { key: "30d", label: t("Last 30 days", "آخر ٣٠ يوم") },
    { key: "year", label: t("This year", "هذا العام") },
    { key: "custom", label: t("Custom", "مخصص") },
  ];
  const statuses: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("All orders", "كل الطلبات") },
    { key: "fully_paid", label: t("Fully paid", "مدفوع بالكامل") },
    { key: "partial", label: t("Partial", "مدفوع جزئياً") },
    { key: "unpaid", label: t("Unpaid", "غير مدفوع") },
  ];
  const methods: { key: MethodFilter; label: string }[] = [
    { key: "all", label: t("All methods", "كل الطرق") },
    { key: "cash", label: t("Cash", "كاش") },
    { key: "receipt", label: t("Receipt", "إيصال") },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("Finance", "المالية")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("How much came in, when, and what's still owed.", "كام دخل، إمتى، وكام لسه مستحق.")}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={<Wallet size={18} />} tone="green" label={t("Collected (in range)", "المحصّل (في الفترة)")} value={fmt(collected)} sub={`${txns.length} ${t("payments", "دفعة")}`} />
        <SummaryCard icon={<Clock size={18} />} tone="amber" label={t("Outstanding (all)", "المتبقّي (إجمالي)")} value={fmt(outstanding)} sub={t("across all orders", "على كل الطلبات")} />
        <SummaryCard icon={<TrendingUp size={18} />} tone="blue" label={t("Orders value (all)", "قيمة الطلبات (إجمالي)")} value={fmt(totalValue)} sub={`${orders.length} ${t("orders", "طلب")}`} />
        <SummaryCard
          icon={<Coins size={18} />}
          tone="violet"
          label={t("Cash / Receipt", "كاش / إيصال")}
          value={fmt(cashTotal)}
          sub={`${t("receipt", "إيصال")}: ${fmt(receiptTotal)}`}
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4 grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground me-1">{t("Date", "التاريخ")}</span>
            {datePresets.map((p) => (
              <button key={p.key} type="button" className={chip(preset === p.key)} onClick={() => setPreset(p.key)}>
                {p.label}
              </button>
            ))}
            {preset === "custom" && (
              <div className="flex items-center gap-2">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-auto" />
                <span className="text-muted-foreground text-xs">→</span>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-auto" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground me-1">{t("Order status", "حالة الطلب")}</span>
            {statuses.map((s) => (
              <button key={s.key} type="button" className={chip(status === s.key)} onClick={() => setStatus(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground me-1">{t("Method", "الطريقة")}</span>
            {methods.map((m) => (
              <button key={m.key} type="button" className={chip(method === m.key)} onClick={() => setMethod(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly breakdown */}
      {byMonth.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {byMonth.map(([key, total]) => (
            <div key={key} className="rounded-xl border border-border/60 bg-card p-3">
              <p className="text-[11px] text-muted-foreground truncate">{monthLabel(key)}</p>
              <p className="text-sm font-bold mt-1">{fmt(total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Income log */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <h2 className="text-sm font-semibold">{t("Income log", "سجل الدفعات المحصّلة")}</h2>
            <span className="text-xs text-muted-foreground">{txns.length} {t("entries", "عملية")}</span>
          </div>
          {txns.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t("No income in this range.", "لا توجد دفعات محصّلة في هذه الفترة.")}
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {txns.map((x) => (
                <div key={x.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${x.isCash ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}>
                    {x.isCash ? <Banknote size={16} /> : <Receipt size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{x.orderTitle}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {x.clientName} · {fmtDate(x.date)} · {x.isCash ? t("Cash", "كاش") : t("Receipt", "إيصال")}
                    </p>
                  </div>
                  <StatusBadge status={x.status} t={t} />
                  <p className="text-sm font-bold text-green-500 whitespace-nowrap">+{fmt(x.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  tone: "green" | "amber" | "blue" | "violet";
  label: string;
  value: string;
  sub: string;
}) {
  const tones: Record<string, string> = {
    green: "bg-green-500/10 text-green-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    violet: "bg-violet-500/10 text-violet-500",
  };
  return (
    <Card>
      <CardContent className="py-4">
        <span className={`grid h-9 w-9 place-items-center rounded-lg mb-3 ${tones[tone]}`}>{icon}</span>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold mt-0.5 truncate">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, t }: { status: OrderStatus; t: (en: string, ar: string) => string }) {
  if (status === "fully_paid")
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hidden sm:inline-flex">{t("Paid", "مدفوع")}</Badge>;
  if (status === "partial")
    return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hidden sm:inline-flex">{t("Partial", "جزئي")}</Badge>;
  return <Badge variant="secondary" className="hidden sm:inline-flex">{t("Unpaid", "غير مدفوع")}</Badge>;
}
