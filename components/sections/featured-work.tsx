"use client";

import { useI18n } from "@/lib/i18n";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "@/components/link";
import Image from "next/image";

type PortfolioItem = {
  id: string;
  title_en: string;
  title_ar: string;
  category: string | null;
  category_id: string | null;
  media_url: string;
  thumbnail_url: string | null;
  media_type: string;
};

type Category = { id: string; name_en: string; name_ar: string };

export function FeaturedWork({
  items,
  categories = [],
}: {
  items: PortfolioItem[];
  categories?: Category[];
}) {
  const { isAr } = useI18n();

  const categoryLabel = (item: PortfolioItem) => {
    const cat = categories.find((c) => c.id === item.category_id);
    if (cat) return isAr ? cat.name_ar || cat.name_en : cat.name_en || cat.name_ar;
    return item.category || "";
  };

  // Nothing published yet — stay quiet rather than showing an empty shelf.
  if (items.length === 0) return null;

  return (
    <section className="relative border-t border-border bg-background py-32 sm:py-44">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-16 flex items-center gap-6">
          <span className="eyebrow whitespace-nowrap">
            {isAr ? "أعمال مختارة" : "Featured Work"}
          </span>
          <span className="rule" />
          <Link
            href="/portfolio"
            className="group hidden shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-bright sm:inline-flex cursor-pointer"
          >
            {isAr ? "عرض الكل" : "View all"}
            <ArrowRight
              size={15}
              className={`transition-transform duration-300 ${
                isAr
                  ? "rotate-180 group-hover:-translate-x-1"
                  : "group-hover:translate-x-1"
              }`}
            />
          </Link>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <Link
                href="/portfolio"
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer"
              >
                {item.thumbnail_url || item.media_type === "image" ? (
                  <Image
                    src={item.thumbnail_url || item.media_url}
                    alt={isAr ? item.title_ar : item.title_en}
                    fill
                    className="object-cover transition-transform [transition-duration:900ms] ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-surface">
                    <Play size={30} className="text-muted-foreground" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="eyebrow text-[hsl(var(--echo-accent))]">
                    {categoryLabel(item)}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {isAr ? item.title_ar : item.title_en}
                  </h3>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn className="mt-12 sm:hidden">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground cursor-pointer"
          >
            {isAr ? "عرض الكل" : "View all"}
            <ArrowRight size={15} className={isAr ? "rotate-180" : ""} />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
