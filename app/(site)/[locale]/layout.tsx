import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Tajawal } from "next/font/google";
import "@/app/globals.css";
import "lenis/dist/lenis.css";
import { I18nProvider } from "@/lib/i18n";
import { LOCALES, isLocale, dirFor, siteUrl, type Locale } from "@/lib/locale";
import { brand } from "@/lib/brand";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SplashScreen } from "@/components/splash-screen";
import { ContentProvider } from "@/components/content-provider";
import { getSectionMap } from "@/lib/content-server";
import { getSiteContact } from "@/lib/settings-server";
import { AuthRecoveryHandler } from "@/components/auth-recovery-handler";

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

/** Pre-render both language trees at build time. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: brand.name, template: `%s — ${brand.name}` },
  applicationName: brand.name,
  authors: [{ name: brand.name }],
  creator: brand.name,
  publisher: brand.name,
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const [sections, contact] = await Promise.all([getSectionMap(), getSiteContact()]);

  return (
    <html
      lang={typed}
      dir={dirFor(typed)}
      className={`${inter.variable} ${tajawal.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-screen flex flex-col bg-background"
        suppressHydrationWarning
      >
        <SplashScreen />
        <AuthRecoveryHandler />
        <I18nProvider locale={typed}>
          <ContentProvider value={sections}>
            <SmoothScroll />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer contact={contact} />
          </ContentProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
