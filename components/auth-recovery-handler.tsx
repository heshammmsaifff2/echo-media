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
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const target = `/auth/update-password${hash}`;

      if (access_token && refresh_token) {
        const supabase = createClient();
        supabase.auth.setSession({ access_token, refresh_token }).finally(() => {
          window.location.replace(target);
        });
        return;
      }

      window.location.replace(target);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && window.location.hash.includes("recovery"))) {
        if (session) {
          supabase.auth.setSession(session).finally(() => {
            window.location.replace("/auth/update-password");
          });
        } else {
          window.location.replace("/auth/update-password");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  return null;
}
