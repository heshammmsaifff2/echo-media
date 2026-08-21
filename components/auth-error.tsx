"use client";

import { useI18n } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { use } from "react";

export function AuthErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = use(searchParams);
  const { isAr } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mx-auto mb-2">
            echo<span className="text-blue-500">.</span>
          </Link>
          <CardTitle className="text-xl">
            {isAr ? "عذراً، حدث خطأ" : "Sorry, something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {params?.error ? (
            <p className="text-sm text-muted-foreground text-center">
              {isAr ? "رمز الخطأ:" : "Error code:"} {params.error}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              {isAr ? "حدث خطأ غير محدد." : "An unspecified error occurred."}
            </p>
          )}
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm underline underline-offset-4 text-foreground">
              {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
