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
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAr } = useI18n();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-bold tracking-tight mx-auto mb-2">
              echo<span className="text-blue-500">.</span>
            </Link>
            <CardTitle className="text-xl">
              {isAr ? "تحقق من بريدك الإلكتروني" : "Check Your Email"}
            </CardTitle>
            <CardDescription>
              {isAr ? "تم إرسال تعليمات إعادة تعيين كلمة المرور" : "Password reset instructions sent"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              {isAr
                ? "إذا كان لديك حساب مسجل بهذا البريد، ستتلقى رسالة لإعادة تعيين كلمة المرور."
                : "If you registered using your email and password, you will receive a password reset email."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-bold tracking-tight mx-auto mb-2">
              echo<span className="text-blue-500">.</span>
            </Link>
            <CardTitle className="text-xl">
              {isAr ? "إعادة تعيين كلمة المرور" : "Reset Your Password"}
            </CardTitle>
            <CardDescription>
              {isAr
                ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين"
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading
                    ? isAr ? "جاري الإرسال..." : "Sending..."
                    : isAr ? "إرسال رابط الإعادة" : "Send reset link"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {isAr ? "تذكرت كلمة المرور؟" : "Remember your password?"}{" "}
                <Link href="/auth/login" className="underline underline-offset-4 text-foreground">
                  {isAr ? "تسجيل الدخول" : "Sign in"}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
