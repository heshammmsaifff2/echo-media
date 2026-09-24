"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<"checking" | "ready" | "no_session">("checking");
  const { isAr } = useI18n();

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function initSession() {
      try {
        // 1. Check if an active session already exists in cookies/storage
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setSessionStatus("ready");
          return;
        }

        // 2. Check for hash parameters (#access_token=...&refresh_token=...)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");

          if (access_token && refresh_token) {
            const { data, error: setSessionErr } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (!setSessionErr && data.session && mounted) {
              setSessionStatus("ready");
              return;
            }
          }
        }

        // 3. Check for query parameters (?code=... or ?token_hash=...)
        if (typeof window !== "undefined" && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search);
          const code = searchParams.get("code");
          const token_hash = searchParams.get("token_hash");

          if (code) {
            const { data, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!codeErr && data.session && mounted) {
              setSessionStatus("ready");
              return;
            }
          } else if (token_hash) {
            const { data, error: otpErr } = await supabase.auth.verifyOtp({
              token_hash,
              type: "recovery",
            });
            if (!otpErr && data.session && mounted) {
              setSessionStatus("ready");
              return;
            }
          }
        }

        // If no active session found after all checks
        if (mounted) {
          setSessionStatus("no_session");
        }
      } catch (err) {
        console.error("Error establishing recovery session:", err);
        if (mounted) {
          setSessionStatus("no_session");
        }
      }
    }

    initSession();

    // Listen to auth state changes (e.g. PASSWORD_RECOVERY or SIGNED_IN)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session && mounted) {
        setSessionStatus("ready");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(
        isAr
          ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
          : "Password must be at least 6 characters",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isAr
          ? "كلمتا المرور غير متطابقتين"
          : "Passwords do not match",
      );
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      // Ensure session is active before updating
      let { data: { session } } = await supabase.auth.getSession();

      // Fallback: if session was not found, check hash again
      if (!session && typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");
        if (access_token && refresh_token) {
          const { data } = await supabase.auth.setSession({ access_token, refresh_token });
          session = data.session;
        }
      }

      if (!session) {
        throw new Error(
          isAr
            ? "انتهت صلاحية جلسة الاستعادة. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور."
            : "Auth session missing. Please request a new password reset link.",
        );
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      window.location.href = "/auth/callback";
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : isAr
            ? "حدث خطأ أثناء حفظ كلمة المرور"
            : "An error occurred while saving password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mx-auto mb-2">
            echo<span className="text-blue-500">.</span>
          </Link>
          <CardTitle className="text-xl">
            {isAr ? "تعيين كلمة مرور جديدة" : "Set New Password"}
          </CardTitle>
          <CardDescription>
            {isAr ? "أدخل كلمة المرور الجديدة" : "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionStatus === "checking" ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-sm">
                {isAr ? "جاري التحقق من صلاحية الرابط..." : "Verifying reset link..."}
              </p>
            </div>
          ) : sessionStatus === "no_session" ? (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  {isAr ? "رابط الاستعادة غير صالح أو منتهي الصلاحية" : "Invalid or expired reset link"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAr
                    ? "الرابط تم استخدامه بالفعل أو انتهت مدة صلاحيته. يرجى طلب رابط استعادة جديد."
                    : "This link has already been used or has expired. Please request a new one."}
                </p>
              </div>
              <Button asChild className="w-full cursor-pointer mt-2">
                <Link href="/auth/login">
                  {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {isAr ? "كلمة المرور الجديدة" : "New password"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">
                    {isAr ? "تأكيد كلمة المرور" : "Confirm new password"}
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    dir="ltr"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      {isAr ? "جاري الحفظ..." : "Saving..."}
                    </>
                  ) : isAr ? (
                    "حفظ كلمة المرور"
                  ) : (
                    "Save new password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
