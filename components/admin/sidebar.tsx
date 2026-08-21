"use client";

import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Image, ShoppingCart, Users, ArrowLeft } from "lucide-react";

// Site copy is fixed in lib/brand.ts, so there is no CMS entry here any more.
const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, labelEn: "Dashboard", labelAr: "الرئيسية" },
  { href: "/admin/portfolio", icon: Image, labelEn: "Portfolio", labelAr: "الأعمال" },
  { href: "/admin/orders", icon: ShoppingCart, labelEn: "Orders", labelAr: "الطلبات" },
  { href: "/admin/clients", icon: Users, labelEn: "Clients", labelAr: "العملاء" },
];

export function AdminSidebar({ profile }: { profile: { full_name: string; email: string } }) {
  const pathname = usePathname();
  const { isAr } = useI18n();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-e border-border/40 bg-card/50 p-4">
      <div className="mb-6 px-2">
        <p className="text-sm font-semibold">{profile.full_name || (isAr ? "مدير" : "Admin")}</p>
        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon size={18} />
              {isAr ? item.labelAr : item.labelEn}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border/40">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft size={18} />
          {isAr ? "العودة للموقع" : "Back to Site"}
        </Link>
      </div>
    </aside>
  );
}
