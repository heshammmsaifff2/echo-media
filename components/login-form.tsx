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

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAr } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Clients sign in with a username (no "@"); map it to the synthetic email
      // their account was created with. Admins keep using their real email.
      const id = email.trim();
      const loginEmail = id.includes("@") ? id : `${id.toLowerCase()}@clients.echo.local`;
      const { error: authError } =
        await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (authError) throw authError;

      window.location.href = "/auth/callback";
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : "";
      let message = isAr ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during sign in";
      if (rawMessage.toLowerCase().includes("invalid login credentials")) {
        message = isAr ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password";
      } else if (rawMessage) {
        message = rawMessage;
      }
      setError(message);
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
            {isAr ? "مرحباً بعودتك" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isAr ? "سجل دخول إلى حسابك" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  {isAr ? "اسم المستخدم أو البريد الإلكتروني" : "Username or email"}
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder={isAr ? "اسم المستخدم أو you@example.com" : "username or you@example.com"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  autoCapitalize="none"
                  autoCorrect="off"
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading
                  ? isAr ? "جاري تسجيل الدخول..." : "Signing in..."
                  : isAr ? "تسجيل الدخول" : "Sign In"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
