import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import "@/app/globals.css";
import { I18nProvider } from "@/lib/i18n";
import { siteUrl } from "@/lib/locale";
import { brand } from "@/lib/brand";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

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
 * No I18nProvider locale prop: the portal follows whatever language the visitor
 * last chose on the public site.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: brand.name, template: `%s — ${brand.name}` },
  robots: { index: false, follow: false, nocache: true },
};

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${tajawal.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-screen flex flex-col bg-background"
        suppressHydrationWarning
      >
        <I18nProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
