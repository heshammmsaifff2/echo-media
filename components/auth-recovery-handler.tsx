"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthRecoveryHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/auth/update-password")) return;

    // 1. Direct hash inspection (e.g. #access_token=...&type=recovery)
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      window.location.replace(`/auth/update-password${hash}`);
      return;
    }

    // 2. Query parameter inspection (e.g. ?type=recovery)
    const search = window.location.search;
    if (search && search.includes("type=recovery")) {
      window.location.replace(`/auth/update-password${search}${hash}`);
      return;
    }

    // 3. Supabase Auth state listener for PASSWORD_RECOVERY event
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        window.location.replace("/auth/update-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  return null;
}
