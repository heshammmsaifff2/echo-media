"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  contentBg,
  contentField,
  sectionDef,
  type SectionBg,
  type SectionRow,
} from "@/lib/content";

const ContentContext = createContext<Record<string, SectionRow>>({});

/**
 * Holds the section_content rows fetched on the server for the current request
 * and hands them to the client section components by slug.
 */
export function ContentProvider({
  value,
  children,
}: {
  value: Record<string, SectionRow>;
  children: ReactNode;
}) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** The DB row for a section slug, or undefined when nothing is stored yet. */
export function useSectionRow(slug: string): SectionRow | undefined {
  return useContext(ContentContext)[slug];
}

/**
 * Everything a section needs: its resolved background (DB override or the
 * registry default) and a `field` reader that falls back to the brand default.
 */
export function useSection(slug: string): {
  bg: SectionBg;
  field: <T>(id: string, fallback: T) => T;
} {
  const row = useContext(ContentContext)[slug];
  const def = sectionDef(slug);
  const fallbackBg: SectionBg = def?.defaultBg ?? { type: "none", url: null, poster: null };
  return {
    bg: contentBg(row, fallbackBg),
    field: (id, fallback) => contentField(row, id, fallback),
  };
}
