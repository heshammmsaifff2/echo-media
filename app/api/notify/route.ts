import { setVapidDetails, sendNotification } from "web-push";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/auth";

/**
 * Admin-only: push a notification to every device of an order's client.
 * Called after the admin adds deliverables/previews or opens downloads.
 */
const MESSAGES = {
  files: { title: "ملفات جديدة لمشروعك", body: (t: string) => `تم رفع ملفات جديدة لمشروع "${t}". اضغط لعرضها.` },
  preview: { title: "معاينة جديدة لمشروعك", body: (t: string) => `أُضيفت معاينة جديدة لمشروع "${t}".` },
  unlocked: { title: "ملفاتك جاهزة للتحميل", body: (t: string) => `تم فتح تحميل ملفات مشروع "${t}".` },
} as const;

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "Push keys are not configured" }, { status: 500 });
  }
  setVapidDetails(process.env.VAPID_SUBJECT || "mailto:notifications@echo-media.local", publicKey, privateKey);

  const { orderId, kind } = (await req.json().catch(() => ({}))) as { orderId?: string; kind?: keyof typeof MESSAGES };
  const message = kind && MESSAGES[kind];
  if (!orderId || !message) {
    return NextResponse.json({ error: "orderId and a valid kind are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("client_orders")
    .select("client_id, project_title")
    .eq("id", orderId)
    .single();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", order.client_id);
  if (!subs?.length) return NextResponse.json({ sent: 0, devices: 0 });

  const payload = JSON.stringify({
    title: message.title,
    body: message.body(order.project_title),
    url: "/dashboard",
    tag: `order-${orderId}`,
    dir: "rtl",
    lang: "ar",
  });

  let sent = 0;
  const dead: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
      } catch (err) {
        // 404/410: the browser dropped this subscription (uninstalled, permission revoked).
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) dead.push(s.id);
      }
    })
  );
  if (dead.length) await supabase.from("push_subscriptions").delete().in("id", dead);

  return NextResponse.json({ sent, devices: subs.length, removed: dead.length });
}
