"use client";

import { useState } from "react";
import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_NAV } from "@/components/admin/nav-items";
import { Menu, X, ArrowLeft, LogOut } from "lucide-react";

/**
 * The admin panel's own top bar — shown on mobile only (the sidebar covers
 * desktop). Kept separate from the public site navbar so the panel is usable
 * on a phone.
 */
export function AdminNavbar({ profile }: { profile: { full_name: string; email: string } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAr } = useI18n();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="font-bold tracking-tight">
          echo<span className="text-[hsl(var(--echo-accent))]">.</span>{" "}
          <span className="text-sm font-medium text-muted-foreground">{isAr ? "الأدمن" : "Admin"}</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="grid h-9 w-9 place-items-center rounded-lg text-foreground cursor-pointer"
          aria-label={isAr ? "القائمة" : "Menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-border/60 px-3 py-3">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon size={18} />
                {isAr ? item.labelAr : item.labelEn}
              </Link>
            );
          })}
          <div className="mt-2 grid gap-1 border-t border-border/60 pt-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <ArrowLeft size={18} /> {isAr ? "العودة للموقع" : "Back to Site"}
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut size={18} /> {isAr ? "تسجيل الخروج" : "Sign out"}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
