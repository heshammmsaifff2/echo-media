"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";

function SplashScreenInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Initial load state
  const [initialLoading, setInitialLoading] = useState(true);
  // Route navigation loading state
  const [navLoading, setNavLoading] = useState(false);

  // 1. Initial Page Load
  useEffect(() => {
    // Dismiss initial loader once mounted and ready
    const timer = setTimeout(() => {
      startTransition(() => {
        setInitialLoading(false);
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [startTransition]);

  // 2. Intercept internal link clicks to trigger route navigation splash
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, target="_blank", or hash-only links
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }

      // Ignore if clicking the exact current URL (including search)
      try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(href, window.location.origin);
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          return;
        }
      } catch {
        // In case of invalid URL
      }

      // Ignore modifier clicks (e.g. Cmd/Ctrl + Click for new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Start transition loader
      setNavLoading(true);
    };

    const handlePopState = () => {
      setNavLoading(true);
    };

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 3. When pathname or searchParams change, dismiss navigation loader
  useEffect(() => {
    if (!initialLoading) {
      const dismissTimer = setTimeout(() => {
        setNavLoading(false);
      }, 250);

      return () => clearTimeout(dismissTimer);
    }
  }, [pathname, searchParams, initialLoading]);

  // 4. Safety timeout to prevent getting stuck under any condition
  useEffect(() => {
    if (navLoading) {
      const safetyTimer = setTimeout(() => {
        setNavLoading(false);
      }, 3000);
      return () => clearTimeout(safetyTimer);
    }
  }, [navLoading]);

  const isVisible = initialLoading || navLoading;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.015,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070707] selection:bg-none select-none pointer-events-auto cursor-wait"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(91, 124, 255, 0.15) 0%, transparent 60%)",
            }}
          />

          {/* Logo with gentle cinematic breathing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            <Logo variant="white" height={38} priority />

            {/* Acoustic soundwave resonance loader bars */}
            <div className="mt-7 flex items-center justify-center gap-1.5 h-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="w-[3px] bg-[hsl(var(--echo-accent))] rounded-full shadow-[0_0_12px_hsl(var(--echo-accent)/0.6)]"
                  animate={{
                    height: ["6px", "22px", "6px"],
                    opacity: [0.45, 1, 0.45],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.85,
                    delay: i * 0.12,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SplashScreen() {
  return (
    <Suspense fallback={null}>
      <SplashScreenInner />
    </Suspense>
  );
}
