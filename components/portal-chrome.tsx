"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { Contact } from "@/lib/brand";

/**
 * The admin panel has its own top bar + sidebar, so it must NOT also get the
 * public site navbar/footer. Everything else in the portal (sign-in, client
 * dashboard) keeps them.
 */
export function PortalChrome({
  contact,
  children,
}: {
  contact: Contact;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <main className="flex-1">{children}</main>;

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer contact={contact} />
    </>
  );
}
