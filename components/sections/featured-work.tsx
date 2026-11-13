"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { ArrowRight, Play, X, Volume2, Sparkles } from "lucide-react";
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
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  const categoryLabel = (item: PortfolioItem) => {
    const cat = categories.find((c) => c.id === item.category_id);
    if (cat) return isAr ? cat.name_ar || cat.name_en : cat.name_en || cat.name_ar;
    return item.category || "";
  };

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveItem(null);
    };
    if (activeItem) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItem]);

  // Nothing published yet — stay quiet rather than showing an empty shelf.
  if (items.length === 0) return null;

  return (
    <section className="relative border-t border-white/10 bg-transparent py-32 sm:py-44">
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
            {isAr ? "عرض كل الأعمال" : "View all works"}
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
          {items.map((item) => {
            const isVideo = item.media_type === "video" || item.media_url.includes("/video/upload/");
            return (
              <StaggerItem key={item.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveItem(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveItem(item);
                    }
                  }}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/15 bg-[#030922]/75 cursor-pointer transition-all duration-300 hover:border-white/35 hover:shadow-2xl hover:shadow-[#2f6de8]/25 select-none"
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
                    <div className="absolute inset-0 grid place-items-center bg-[#030922]/40">
                      <Play size={30} className="text-muted-foreground" />
                    </div>
                  )}

                  {/* Play badge for videos */}
                  {isVideo && (
                    <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none">
                      <span className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full border border-white/25 bg-[hsl(var(--echo-base)/0.7)] text-white backdrop-blur-md shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[hsl(var(--echo-accent))]">
                        <Play size={22} className="translate-x-0.5 fill-current" />
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--echo-base)/0.92)] via-[hsl(var(--echo-base)/0.25)] to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-7 z-10">
                    <span className="eyebrow text-[hsl(var(--echo-accent))]">
                      {categoryLabel(item)}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {isAr ? item.title_ar : item.title_en}
                    </h3>
                    <p className="mt-1 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
                      <Play size={12} className="fill-current" />
                      <span>{isAr ? "اضغط للمشاهدة الفورية هنا" : "Click to play inline"}</span>
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeIn className="mt-12 sm:hidden">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground cursor-pointer"
          >
            {isAr ? "عرض كل الأعمال" : "View all works"}
            <ArrowRight size={15} className={isAr ? "rotate-180" : ""} />
          </Link>
        </FadeIn>
      </div>

      {/* ── Direct Inline Video Player Modal ─────────────────────────────── */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setActiveItem(null)}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="absolute top-5 end-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 cursor-pointer shadow-lg"
          >
            <X size={20} />
          </button>

          {/* Player container */}
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.media_type === "video" || activeItem.media_url.includes("/video/upload/") ? (
              <video
                src={activeItem.media_url}
                poster={activeItem.thumbnail_url || undefined}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full h-auto object-contain bg-black"
              />
            ) : (
              <div className="relative aspect-video w-full bg-black">
                <Image
                  src={activeItem.media_url}
                  alt={isAr ? activeItem.title_ar : activeItem.title_en}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Video footer info */}
            <div className="p-4 sm:p-5 bg-card/95 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-[hsl(var(--echo-accent))] uppercase tracking-wider">
                  {categoryLabel(activeItem)}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {isAr ? activeItem.title_ar : activeItem.title_en}
                </h4>
              </div>

              <Link
                href="/portfolio"
                onClick={() => setActiveItem(null)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white px-3.5 py-2 rounded-lg border border-white/15 bg-white/5 transition-colors cursor-pointer shrink-0"
              >
                <span>{isAr ? "فتح في المعرض" : "Open in portfolio"}</span>
                <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
