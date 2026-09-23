/** A single installment against a client order. */
export type Payment = {
  id: string;
  order_id: string;
  amount: number;
  receipt_url: string | null;
  is_cash: boolean;
  is_confirmed: boolean;
  note: string | null;
  created_by: "client" | "admin";
  created_at: string;
  confirmed_at: string | null;
};

/** Sum of confirmed payments — what the client has actually paid. */
export function confirmedTotal(payments: Payment[] = []): number {
  return payments
    .filter((p) => p.is_confirmed)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

/** Remaining balance on an order (never negative). */
export function remainingBalance(total: number, payments: Payment[] = []): number {
  return Math.max(0, Number(total || 0) - confirmedTotal(payments));
}

/** True once confirmed payments cover the full total (and there is a total). */
export function isFullyPaid(total: number, payments: Payment[] = []): boolean {
  return Number(total || 0) > 0 && confirmedTotal(payments) >= Number(total);
}
