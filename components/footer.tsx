"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/link";
import { useI18n } from "@/lib/i18n";
import {
  brand,
  contact as defaultContact,
  footer,
  nav,
  architecture,
  telHref,
  whatsappHref,
  type Contact,
} from "@/lib/brand";
import { Logo } from "@/components/logo";
import { Mail, Phone, MapPin, MessageCircle, ArrowUpRight, Camera } from "lucide-react";

export function Footer({
  contact = defaultContact,
  studioContact,
}: {
  contact?: Contact;
  studioContact?: Contact;
}) {
  const { pick, isAr } = useI18n();
  const pathname = usePathname() || "";
  const isStudioPage = pathname.includes("/art-house-studio");
  const activeContact = isStudioPage && studioContact ? studioContact : contact;
  const year = new Date().getFullYear();

  const address = activeContact.address ? pick(activeContact.address).trim() : "";
  const locality = activeContact.location ? pick(activeContact.location).trim() : "";

  return (
    <footer className="relative border-t border-white/10 bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-24">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link
              href={isStudioPage ? "/art-house-studio" : "/"}
              aria-label={isStudioPage ? "Art House Studio" : "Echo Media Production — home"}
              className="cursor-pointer"
            >
              <Logo variant="white" height={30} />
            </Link>

            {isStudioPage ? (
              <div className="mt-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--echo-accent)/0.3)] bg-[hsl(var(--echo-accent)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--echo-accent))]">
                  <Camera size={13} />
                  <span>{isAr ? "استوديو آرت هاوس" : "Art House Studio"}</span>
                </span>
                <p className="max-w-sm leading-relaxed text-muted-foreground text-sm">
                  {isAr
                    ? "استوديو احترافي مجهز بالكامل للإنتاج السينمائي والبودكاست والتصوير الفوتوغرافي."
                    : "Fully equipped creative studio space for commercial video, multicam podcasts, and photography."}
                </p>
              </div>
            ) : (
              <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
                {pick(footer.tagline)}
              </p>
            )}

            <p
              className="mt-8 text-lg font-light tracking-[0.16em] text-[hsl(var(--echo-accent))]"
              dir="ltr"
            >
              {brand.motto}
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="eyebrow mb-6">{isAr ? "روابط" : "Navigate"}</h3>
            <ul className="space-y-3">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-bright cursor-pointer"
                  >
                    {pick(link.label)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/auth/login"
                  className="text-muted-foreground transition-colors hover:text-bright cursor-pointer"
                >
                  {isAr ? "بوابة العملاء" : "Client Portal"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="eyebrow mb-6">
              {isStudioPage
                ? (isAr ? "تواصل مع الاستوديو" : "Studio Contact")
                : (isAr ? "تواصل" : "Contact")}
            </h3>
            <ul className="space-y-4">
              {activeContact.email && (
                <li>
                  <a
                    href={`mailto:${activeContact.email}`}
                    className="inline-flex items-center gap-3 text-muted-foreground transition-colors hover:text-bright cursor-pointer"
                  >
                    <Mail size={15} className="shrink-0" />
                    <span dir="ltr">{activeContact.email}</span>
                  </a>
                </li>
              )}

              {(activeContact.phones || []).map((phone) => (
                <li key={phone.number} className="flex items-center gap-3">
                  <Phone size={15} className="shrink-0 text-muted-foreground" />
                  <a
                    href={telHref(phone.number)}
                    className="text-muted-foreground transition-colors hover:text-bright cursor-pointer"
                    dir="ltr"
                  >
                    {phone.number}
                  </a>
                  <span className="text-xs text-muted-foreground/60">
                    {pick(phone.label)}
                  </span>
                  {phone.whatsapp && (
                    <a
                      href={whatsappHref(phone.number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${phone.number}`}
                      className="text-muted-foreground transition-colors hover:text-[hsl(var(--echo-accent))] cursor-pointer"
                    >
                      <MessageCircle size={14} />
                    </a>
                  )}
                </li>
              ))}

              {/* Address is optional — rendered only when contact has one. */}
              {(address || locality) && (
                <li>
                  {activeContact.mapUrl ? (
                    <a
                      href={activeContact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-bright cursor-pointer"
                    >
                      <MapPin size={15} className="mt-1 shrink-0" />
                      <span>
                        {address && <span className="block">{address}</span>}
                        {locality && (
                          <span className="mt-0.5 block text-sm text-muted-foreground/70">
                            {locality}
                          </span>
                        )}
                      </span>
                    </a>
                  ) : (
                    <span className="flex items-start gap-3 text-muted-foreground">
                      <MapPin size={15} className="mt-1 shrink-0" />
                      <span>
                        {address && <span className="block">{address}</span>}
                        {locality && (
                          <span className="mt-0.5 block text-sm text-muted-foreground/70">
                            {locality}
                          </span>
                        )}
                      </span>
                    </span>
                  )}
                </li>
              )}
            </ul>

            {(activeContact.social || []).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {activeContact.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[hsl(var(--echo-accent))] hover:text-bright cursor-pointer"
                  >
                    {item.name}
                    <ArrowUpRight
                      size={12}
                      className={`transition-transform duration-300 group-hover:-translate-y-0.5 ${
                        isAr ? "-scale-x-100" : ""
                      }`}
                    />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-10">
              <h3 className="eyebrow mb-4">{pick(architecture.label)}</h3>
              <div className="flex flex-wrap gap-2">
                {architecture.divisions.map((d) => (
                  <Link
                    key={d.href}
                    href={d.href}
                    className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[hsl(var(--echo-accent))] hover:text-bright cursor-pointer"
                  >
                    {pick(d.name)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            © {year} {isStudioPage ? "Art House Studio & Echo Media Production" : brand.name}. {pick(footer.rights)}
          </p>
        </div>
      </div>
    </footer>
  );
}
