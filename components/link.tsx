"use client";

import NextLink from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useI18n } from "@/lib/i18n";
import { localePath, isLocale } from "@/lib/locale";

/** Paths that live outside the localized tree and must never be prefixed. */
const UNLOCALIZED = ["/auth", "/admin", "/dashboard", "/protected", "/api"];

type Props = ComponentPropsWithoutRef<typeof NextLink>;

/**
 * Drop-in replacement for next/link that prefixes internal paths with the
 * active locale, so `href="/portfolio"` resolves to `/en/portfolio` or
 * `/ar/portfolio` without every call site having to know the locale.
 *
 * External URLs, anchors, mailto/tel, portal routes, and paths that already
 * carry a locale are passed through untouched.
 */
export const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, ...props },
  ref
) {
  const { locale } = useI18n();
  return <NextLink ref={ref} href={resolveHref(href, locale)} {...props} />;
});

function resolveHref(href: Props["href"], locale: string): Props["href"] {
  if (typeof href !== "string") return href;
  if (!href.startsWith("/")) return href; // external, hash, mailto:, tel:
  if (UNLOCALIZED.some((p) => href === p || href.startsWith(`${p}/`))) return href;

  const first = href.split("/")[1];
  if (isLocale(first)) return href; // already localized

  return localePath(locale as Parameters<typeof localePath>[0], href);
}
