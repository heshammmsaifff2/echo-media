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
import { Menu, X, LogOut, LayoutDashboard, ChevronUp } from "lucide-react";

export function Navbar() {
  const { locale, isAr, pick } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Hide-on-scroll: past the first component the navbar tucks away and a small
  // toggle reveals it. `navOpen` is the manual override from that toggle.
  const [pastFirst, setPastFirst] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);

  const other = locale === "en" ? "ar" : "en";
  const firstSegment = pathname.split("/")[1];
  const isSitePage = isLocale(firstSegment);
  const switchHref = isSitePage ? switchLocalePath(pathname, other) : pathname;

  const handleLanguageSwitch = (e: React.MouseEvent<HTMLAnchorElement>) => {
    document.cookie = `echo-locale=${other}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem("echo-locale", other);

    if (!isSitePage) {
      e.preventDefault();
      window.location.reload();
    }
  };

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

  // Transparent over the hero, solid once the page moves. Past the first
  // component (~one screen) the bar hides until the visitor reveals it.
  // Polled on rAF rather than the scroll event, because the smooth-scroll layer
  // does not always emit a native scroll event.
  useEffect(() => {
    let raf = 0;
    let lastKey = -1;
    const loop = () => {
      const y = window.scrollY;
      const threshold = Math.max(320, window.innerHeight * 0.7);
      const isScrolled = y > 24;
      const isPast = y > threshold;
      const key = (isScrolled ? 1 : 0) + (isPast ? 2 : 0);
      if (key !== lastKey) {
        lastKey = key;
        setScrolled(isScrolled);
        setPastFirst(isPast);
        if (!isPast) setNavOpen(false);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Only the public site pages hide the bar; the portal keeps it pinned.
  const hidden = isSitePage && pastFirst && !navOpen;

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
    <>
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
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
            onClick={handleLanguageSwitch}
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

                <div className="mt-2 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{isAr ? "اللغة" : "Language"}</span>
                  <NextLink
                    href={switchHref}
                    hrefLang={other}
                    lang={other}
                    onClick={(e) => {
                      setMobileOpen(false);
                      handleLanguageSwitch(e);
                    }}
                    className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[hsl(var(--echo-accent))] cursor-pointer"
                  >
                    {other === "ar" ? "العربية" : "English"}
                  </NextLink>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* Reveal / hide toggle — appears once the bar has tucked away. */}
    {isSitePage && pastFirst && (
      <button
        type="button"
        onClick={() => setNavOpen((o) => !o)}
        aria-label={navOpen ? (isAr ? "إخفاء القائمة" : "Hide menu") : (isAr ? "إظهار القائمة" : "Show menu")}
        className="fixed bottom-5 end-5 z-[60] grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--echo-accent))] text-[hsl(var(--echo-base))] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-4 ring-[hsl(var(--echo-accent))]/20 transition-transform duration-300 hover:scale-110 cursor-pointer"
      >
        {navOpen ? <ChevronUp size={22} /> : <Menu size={22} />}
      </button>
    )}
    </>
  );
}
