import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import "@/app/globals.css";
import { I18nProvider } from "@/lib/i18n";
import { siteUrl, DEFAULT_LOCALE, dirFor, isLocale, type Locale } from "@/lib/locale";
import { brand } from "@/lib/brand";
import { PortalChrome } from "@/components/portal-chrome";
import { SplashScreen } from "@/components/splash-screen";
import { getSiteContact } from "@/lib/settings-server";
import { AuthRecoveryHandler } from "@/components/auth-recovery-handler";
import { cookies } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

/**
 * The portal — sign-in, client dashboard, admin. These pages sit outside the
 * /en and /ar tree because they are private: there is nothing here for a search
 * engine to index, so the whole subtree is marked noindex.
 *
 * Reads the visitor's choice from cookies, defaulting to Arabic (DEFAULT_LOCALE).
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: brand.name, template: `%s — ${brand.name}` },
  robots: { index: false, follow: false, nocache: true },
};

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("echo-locale")?.value;
  const locale: Locale = isLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;
  const contact = await getSiteContact();

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${inter.variable} ${tajawal.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-screen flex flex-col bg-background"
        suppressHydrationWarning
      >
        <SplashScreen />
        <AuthRecoveryHandler />
        <I18nProvider locale={locale}>
          <PortalChrome contact={contact}>{children}</PortalChrome>
        </I18nProvider>
      </body>
    </html>
  );
}
