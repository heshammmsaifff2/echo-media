"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import { switchLocalePath, isLocale, localePath } from "@/lib/locale";
import { nav } from "@/lib/brand";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { locale, isAr, pick } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);

  const other = locale === "en" ? "ar" : "en";
  // Inside the localized tree the switch is a real navigation, so the other
  // language is a crawlable link. On portal pages there is no locale segment,
  // so send the visitor to that language's home page instead.
  const switchHref = isLocale(pathname.split("/")[1])
    ? switchLocalePath(pathname, other)
    : localePath(other, "/");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single()
        .then(({ data: profile }) => {
          setUser({ email: authUser.email, role: profile?.role });
        });
    });
  }, []);

  // Transparent over the hero, solid once the page moves.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const dashboardHref = user?.role === "admin" ? "/admin" : "/dashboard";
  const dashboardLabel =
    user?.role === "admin"
      ? isAr
        ? "لوحة التحكم"
        : "Admin"
      : isAr
        ? "حسابي"
        : "Account";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 sm:px-10">
        <Link href="/" aria-label="Echo Media Production — home" className="cursor-pointer">
          <Logo variant="white" height={26} priority />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-bright cursor-pointer"
            >
              {pick(link.label)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NextLink
            href={switchHref}
            hrefLang={other}
            lang={other}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-300 hover:border-[hsl(var(--echo-accent))] hover:text-bright cursor-pointer"
            aria-label={other === "ar" ? "التبديل إلى العربية" : "Switch to English"}
          >
            {other === "ar" ? "عربي" : "EN"}
          </NextLink>

          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--echo-accent))] px-4 py-2 text-xs font-semibold text-[hsl(var(--echo-base))] transition-transform duration-300 hover:scale-[1.04] cursor-pointer"
              >
                <LayoutDashboard size={13} />
                {dashboardLabel}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                title={isAr ? "تسجيل الخروج" : "Sign out"}
                aria-label={isAr ? "تسجيل الخروج" : "Sign out"}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors duration-300 hover:border-[hsl(var(--echo-accent))] hover:text-bright sm:inline-flex cursor-pointer"
            >
              {isAr ? "تسجيل الدخول" : "Sign in"}
            </Link>
          )}

          <button
            type="button"
            className="grid h-9 w-9 place-items-center text-foreground md:hidden cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={isAr ? "القائمة" : "Toggle menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {nav.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-lg font-medium text-foreground transition-colors hover:text-bright cursor-pointer"
                >
                  {pick(link.label)}
                </Link>
              ))}

              <div className="mt-4 border-t border-border pt-4">
                {user ? (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-3 text-base font-medium text-[hsl(var(--echo-accent))] cursor-pointer"
                    >
                      <LayoutDashboard size={15} />
                      {dashboardLabel}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-2 py-3 text-base font-medium text-destructive cursor-pointer"
                    >
                      <LogOut size={15} />
                      {isAr ? "تسجيل الخروج" : "Sign out"}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-base font-medium text-[hsl(var(--echo-accent))] cursor-pointer"
                  >
                    {isAr ? "تسجيل الدخول" : "Sign in"}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
