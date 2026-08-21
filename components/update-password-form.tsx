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
import { useState } from "react";
import Link from "next/link";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAr } = useI18n();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      window.location.href = "/dashboard";
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
            {isAr ? "تعيين كلمة مرور جديدة" : "Set New Password"}
          </CardTitle>
          <CardDescription>
            {isAr ? "أدخل كلمة المرور الجديدة" : "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading
                  ? isAr ? "جاري الحفظ..." : "Saving..."
                  : isAr ? "حفظ كلمة المرور" : "Save new password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
