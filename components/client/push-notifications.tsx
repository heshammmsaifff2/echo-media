"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, BellRing, Loader2, Share, PlusSquare, Smartphone, Monitor, CheckCircle2 } from "lucide-react";

type Device = "ios" | "android" | "windows" | "mac" | "other";
type Browser = "safari" | "chrome" | "edge" | "firefox" | "samsung" | "other";
type Status = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

function detect(): { device: Device; browser: Browser; standalone: boolean } {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac; touch support gives it away.
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  const device: Device = /iPhone|iPad|iPod/.test(ua) || iPadOS ? "ios"
    : /Android/.test(ua) ? "android"
    : /Windows/.test(ua) ? "windows"
    : /Macintosh/.test(ua) ? "mac"
    : "other";
  const browser: Browser = /SamsungBrowser/.test(ua) ? "samsung"
    : /Edg\//.test(ua) ? "edge"
    : /Firefox|FxiOS/.test(ua) ? "firefox"
    : /Chrome|CriOS/.test(ua) ? "chrome"
    : /Safari/.test(ua) ? "safari"
    : "other";
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { device, browser, standalone };
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Client dashboard card: turn on browser notifications for new deliverables. */
export function PushNotifications({ isAr, userId }: { isAr: boolean; userId: string }) {
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [env, setEnv] = useState<ReturnType<typeof detect> | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const e = detect();
    setEnv(e);
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    // iPhone/iPad only expose push to the site once it is installed to the Home Screen.
    if (e.device === "ios" && !e.standalone) return setStatus("ios-install");
    if (!supported) return setStatus("unsupported");
    if (Notification.permission === "denied") return setStatus("denied");
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    const sub = await reg.pushManager.getSubscription();
    setStatus(sub && Notification.permission === "granted" ? "on" : "off");
  }, []);

  useEffect(() => {
    refresh().catch(() => setStatus("unsupported"));
  }, [refresh]);

  const enable = async () => {
    setBusy(true);
    setError("");
    try {
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error(t("Notifications are not configured yet.", "الإشعارات غير مهيأة بعد."));
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const { error: dbError } = await createClient().from("push_subscriptions").upsert(
        { user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, user_agent: navigator.userAgent },
        { onConflict: "endpoint" }
      );
      if (dbError) throw dbError;
      setStatus("on");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Could not turn on notifications.", "تعذر تفعيل الإشعارات."));
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await createClient().from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(t("Notifications are working", "الإشعارات تعمل"), {
      body: t("You'll be notified here when new files are added to your projects.", "ستصلك إشعارات هنا عند رفع ملفات جديدة لمشاريعك."),
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      dir: isAr ? "rtl" : "ltr",
    });
  };

  if (status === "loading" || !env) return null;

  const DeviceIcon = env.device === "ios" || env.device === "android" ? Smartphone : Monitor;

  return (
    <Card className="mb-6">
      <CardContent className="py-5">
        <div className="flex items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${status === "on" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
            {status === "on" ? <BellRing size={19} /> : status === "denied" ? <BellOff size={19} /> : <Bell size={19} />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{t("Delivery notifications", "إشعارات التسليم")}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("Get a notification on this device as soon as we upload files to your projects.", "يصلك إشعار على هذا الجهاز بمجرد رفع ملفات لمشاريعك.")}
            </p>

            {status === "on" && (
              <div className="mt-3 grid gap-3">
                <p className="flex items-center gap-1.5 text-sm text-green-500"><CheckCircle2 size={15} /> {t("Notifications are on for this device.", "الإشعارات مفعّلة على هذا الجهاز.")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={test} className="cursor-pointer">{t("Send a test", "إرسال إشعار تجريبي")}</Button>
                  <Button size="sm" variant="ghost" onClick={disable} disabled={busy} className="cursor-pointer text-muted-foreground">{t("Turn off", "إيقاف")}</Button>
                </div>
                {env.device === "windows" && (
                  <Hint icon={DeviceIcon}>{t("Not seeing it? Check Windows Settings → System → Notifications, and that Focus / Do not disturb is off.", "لا يظهر؟ تأكد من إعدادات ويندوز ← النظام ← الإشعارات، وأن وضع \"عدم الإزعاج\" مغلق.")}</Hint>
                )}
                {env.device === "mac" && (
                  <Hint icon={DeviceIcon}>{t(`Not seeing it? System Settings → Notifications → ${browserName(env.browser)} → Allow notifications, and turn off Focus.`, `لا يظهر؟ إعدادات النظام ← الإشعارات ← ${browserName(env.browser)} ← السماح بالإشعارات، وأوقف وضع التركيز.`)}</Hint>
                )}
              </div>
            )}

            {status === "off" && (
              <div className="mt-3 grid gap-3">
                <Button onClick={enable} disabled={busy} className="w-fit gap-2 cursor-pointer">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                  {t("Turn on notifications", "تفعيل الإشعارات")}
                </Button>
                <Hint icon={DeviceIcon}>{allowHint(env, t)}</Hint>
              </div>
            )}

            {status === "ios-install" && (
              <div className="mt-3 grid gap-2 text-sm">
                <p className="font-medium">{t("On iPhone/iPad, add Echo to your Home Screen first:", "على الآيفون/الآيباد، أضف Echo للشاشة الرئيسية أولاً:")}</p>
                {env.browser !== "safari" && (
                  <Step n={0}>{t("Open this page in Safari (this only works from Safari).", "افتح هذه الصفحة من متصفح Safari (لا تعمل إلا منه).")}</Step>
                )}
                <Step n={1}><span className="inline-flex items-center gap-1">{t("Tap the Share button", "اضغط زر المشاركة")} <Share size={14} /></span> {t("at the bottom of Safari.", "أسفل الشاشة في Safari.")}</Step>
                <Step n={2}><span className="inline-flex items-center gap-1">{t('Choose "Add to Home Screen"', 'اختر "إضافة إلى الشاشة الرئيسية"')} <PlusSquare size={14} /></span></Step>
                <Step n={3}>{t("Open Echo from its new Home Screen icon and sign in.", "افتح Echo من الأيقونة الجديدة على الشاشة الرئيسية وسجّل دخولك.")}</Step>
                <Step n={4}>{t('Come back here and tap "Turn on notifications".', 'ارجع لهذه الصفحة واضغط "تفعيل الإشعارات".')}</Step>
                <p className="text-xs text-muted-foreground">{t("Requires iOS 16.4 or later.", "يتطلب iOS 16.4 أو أحدث.")}</p>
              </div>
            )}

            {status === "denied" && (
              <div className="mt-3 grid gap-2 text-sm">
                <p className="font-medium text-amber-500">{t("Notifications are blocked for this site. To allow them:", "الإشعارات محظورة لهذا الموقع. للسماح بها:")}</p>
                {deniedSteps(env, t).map((s, i) => <Step key={i} n={i + 1}>{s}</Step>)}
                <Button size="sm" variant="outline" onClick={() => refresh()} className="mt-1 w-fit cursor-pointer">{t("I've allowed it — check again", "سمحت بها — تحقق مرة أخرى")}</Button>
              </div>
            )}

            {status === "unsupported" && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("This browser doesn't support notifications. Try the latest Chrome, Edge, Firefox or Safari.", "هذا المتصفح لا يدعم الإشعارات. جرّب أحدث إصدار من Chrome أو Edge أو Firefox أو Safari.")}
              </p>
            )}

            {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function browserName(b: Browser) {
  return { safari: "Safari", chrome: "Chrome", edge: "Edge", firefox: "Firefox", samsung: "Samsung Internet", other: "your browser" }[b];
}

/** Shown under the button: what the visitor is about to see on their device. */
function allowHint(env: ReturnType<typeof detect>, t: (en: string, ar: string) => string) {
  switch (env.device) {
    case "ios":
      return t('iPhone will ask for permission — tap "Allow".', 'سيطلب الآيفون الإذن — اضغط "سماح".');
    case "android":
      return t('Android will ask for permission — tap "Allow". Keep the browser\'s notifications on in your phone settings.', 'سيطلب الأندرويد الإذن — اضغط "سماح". واترك إشعارات المتصفح مفعّلة في إعدادات الهاتف.');
    case "windows":
      return t(`${browserName(env.browser)} will show a prompt near the address bar — choose "Allow".`, `سيظهر طلب من ${browserName(env.browser)} بجوار شريط العنوان — اختر "السماح".`);
    case "mac":
      return env.browser === "safari"
        ? t('Safari will ask — choose "Allow".', 'سيسألك Safari — اختر "السماح".')
        : t(`${browserName(env.browser)} will ask — choose "Allow". macOS may also ask once to allow ${browserName(env.browser)} itself.`, `سيسألك ${browserName(env.browser)} — اختر "السماح". وقد يطلب نظام macOS مرة واحدة السماح لـ ${browserName(env.browser)} نفسه.`);
    default:
      return t('Your browser will ask for permission — choose "Allow".', 'سيطلب المتصفح الإذن — اختر "السماح".');
  }
}

/** How to undo a "Block", per device and browser. */
function deniedSteps(env: ReturnType<typeof detect>, t: (en: string, ar: string) => string): string[] {
  if (env.device === "ios") {
    return [
      t("Open iPhone Settings → Notifications.", "افتح إعدادات الآيفون ← الإشعارات."),
      t('Find "Echo" and turn on "Allow Notifications".', 'ابحث عن "Echo" وفعّل "السماح بالإشعارات".'),
      t("Come back to the app and check again.", "ارجع للتطبيق وتحقق مرة أخرى."),
    ];
  }
  if (env.browser === "safari") {
    return [
      t("In the menu bar: Safari → Settings → Websites → Notifications.", "من شريط القوائم: Safari ← الإعدادات ← مواقع الويب ← الإشعارات."),
      t('Set this site to "Allow".', 'اجعل هذا الموقع "سماح".'),
      t("Reload the page.", "أعد تحميل الصفحة."),
    ];
  }
  if (env.browser === "firefox") {
    return [
      t("Click the lock icon at the left of the address bar.", "اضغط على أيقونة القفل يسار شريط العنوان."),
      t('Next to "Send notifications", remove the block (×).', 'بجوار "إرسال الإشعارات" احذف الحظر (×).'),
      t('Reload the page and tap "Turn on notifications".', 'أعد تحميل الصفحة واضغط "تفعيل الإشعارات".'),
    ];
  }
  const steps = [
    env.device === "android"
      ? t("Tap the icon at the left of the address bar (or ⋮ → Settings → Site settings).", "اضغط الأيقونة يسار شريط العنوان (أو ⋮ ← الإعدادات ← إعدادات المواقع).")
      : t("Click the icon at the left of the address bar → Site settings.", "اضغط الأيقونة يسار شريط العنوان ← إعدادات الموقع."),
    t('Set "Notifications" to "Allow".', 'اجعل "الإشعارات" على "سماح".'),
    t("Reload the page.", "أعد تحميل الصفحة."),
  ];
  if (env.device === "android") steps.push(t(`Also check: phone Settings → Apps → ${browserName(env.browser)} → Notifications is on.`, `وتأكد أيضاً: إعدادات الهاتف ← التطبيقات ← ${browserName(env.browser)} ← الإشعارات مفعّلة.`));
  if (env.device === "windows") steps.push(t(`Also check: Windows Settings → System → Notifications → ${browserName(env.browser)} is on.`, `وتأكد أيضاً: إعدادات ويندوز ← النظام ← الإشعارات ← ${browserName(env.browser)} مفعّل.`));
  if (env.device === "mac") steps.push(t(`Also check: System Settings → Notifications → ${browserName(env.browser)} → Allow notifications.`, `وتأكد أيضاً: إعدادات النظام ← الإشعارات ← ${browserName(env.browser)} ← السماح بالإشعارات.`));
  return steps;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{n || "!"}</span>
      <span>{children}</span>
    </div>
  );
}

function Hint({ icon: Icon, children }: { icon: typeof Monitor; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <Icon size={13} className="mt-0.5 shrink-0" /> <span>{children}</span>
    </p>
  );
}
