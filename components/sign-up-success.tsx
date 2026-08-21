"use client";

import { useI18n } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function SignUpSuccessContent() {
  const { isAr } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mx-auto mb-2">
            echo<span className="text-blue-500">.</span>
          </Link>
          <CardTitle className="text-xl">
            {isAr ? "شكراً لتسجيلك!" : "Thank you for signing up!"}
          </CardTitle>
          <CardDescription>
            {isAr ? "تحقق من بريدك الإلكتروني للتأكيد" : "Check your email to confirm"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            {isAr
              ? "تم إنشاء حسابك بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك قبل تسجيل الدخول."
              : "You've successfully signed up. Please check your email to confirm your account before signing in."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
