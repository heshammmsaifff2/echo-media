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
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAr } = useI18n();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError(isAr ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : isAr ? "حدث خطأ" : "An error occurred");
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
            {isAr ? "إنشاء حساب جديد" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isAr ? "أدخل بياناتك لإنشاء حساب" : "Enter your details to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">
                  {isAr ? "الاسم الكامل" : "Full Name"}
                </Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder={isAr ? "محمد أحمد" : "John Doe"}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
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
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {isAr ? "كلمة المرور" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">
                  {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  dir="ltr"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading
                  ? isAr ? "جاري إنشاء الحساب..." : "Creating account..."
                  : isAr ? "إنشاء حساب" : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
              <Link href="/auth/login" className="underline underline-offset-4 text-foreground">
                {isAr ? "تسجيل الدخول" : "Sign in"}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
