"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Play, Sparkles, FolderOpen, ArrowRight } from "lucide-react";

type PortfolioItem = {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  media_url: string;
  thumbnail_url: string | null;
  media_type: string;
};

type Category = { id: string; name_en: string; name_ar: string; order_index: number };
type Subcategory = { id: string; category_id: string; name_en: string; name_ar: string; order_index: number };

export function PortfolioGrid({
  items,
  categories,
  subcategories,
}: {
  items: PortfolioItem[];
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const { isAr } = useI18n();
  // Initially null so the user is prompted to select a category first
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<string>("all");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);

  const catName = (c: Category) => (isAr ? c.name_ar || c.name_en : c.name_en || c.name_ar);
  const subName = (s: Subcategory) => (isAr ? s.name_ar || s.name_en : s.name_en || s.name_ar);

  const activeSubs =
    !catFilter || catFilter === "all"
      ? []
      : subcategories.filter((s) => s.category_id === catFilter);

  const filtered =
    catFilter === null
      ? []
      : items.filter((i) => {
          if (catFilter !== "all") {
            const catObj = categories.find((c) => c.id === catFilter);
            const matchesId = i.category_id === catFilter;
            const matchesText = !!(
              catObj &&
              i.category &&
              (catObj.name_en.toLowerCase() === i.category.toLowerCase() ||
                catObj.name_ar === i.category)
            );
            if (!matchesId && !matchesText) return false;
          }
          if (subFilter !== "all" && i.subcategory_id !== subFilter) return false;
          return true;
        });

  const selectCategory = (id: string) => {
    setCatFilter(id);
    setSubFilter("all");
  };

  const getCategoryCount = (catId: string, catEn: string) => {
    return items.filter(
      (i) =>
        i.category_id === catId ||
        (i.category && catEn && i.category.toLowerCase() === catEn.toLowerCase())
    ).length;
  };

  return (
    <>
      <section className="pt-40 pb-28 sm:pt-48 sm:pb-36">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <FadeIn className="mb-12">
            <h1 className="display-lg text-bright">
              {isAr ? "أعمالنا" : "Our Work"}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {isAr
                ? "استعرض مشاريعنا في إنتاج الفيديو والتصوير والبودكاست"
                : "Browse our projects in video production, photography, and podcasts"}
            </p>
          </FadeIn>

          {/* Categories Selector Tabs */}
          <FadeIn delay={0.1} className="mb-6 flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = catFilter === cat.id;
              const count = getCategoryCount(cat.id, cat.name_en);

              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={`group rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer inline-flex items-center gap-2 ${
                    isSelected
                      ? "bg-[hsl(var(--echo-accent))] text-[hsl(var(--echo-base))] font-semibold shadow-lg shadow-[hsl(var(--echo-accent))]/25 scale-[1.02]"
                      : "border border-border text-muted-foreground hover:border-[hsl(var(--echo-accent))]/60 hover:text-bright"
                  }`}
                >
                  <span>{catName(cat)}</span>
                  {count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? "bg-black/20 text-inherit font-bold"
                          : "bg-muted text-muted-foreground group-hover:text-bright"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* View All Works button */}
            <button
              onClick={() => selectCategory("all")}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
                catFilter === "all"
                  ? "bg-[hsl(var(--echo-accent))] text-[hsl(var(--echo-base))] font-semibold shadow-lg shadow-[hsl(var(--echo-accent))]/25 scale-[1.02]"
                  : "border border-border text-muted-foreground hover:border-[hsl(var(--echo-accent))]/60 hover:text-bright"
              }`}
            >
              {isAr ? "جميع الأعمال" : "All Works"}
            </button>
          </FadeIn>

          {/* Subcategories Selector Bar (shown when category is selected and has subcategories) */}
          <AnimatePresence mode="wait">
            {activeSubs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mb-10 flex flex-wrap items-center gap-2 border-y border-border/40 py-3.5"
              >
                <span className="text-xs text-muted-foreground font-medium me-1">
                  {isAr ? "الفرع:" : "Subcategory:"}
                </span>
                <button
                  onClick={() => setSubFilter("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    subFilter === "all"
                      ? "bg-bright text-[hsl(var(--echo-base))] font-semibold"
                      : "border border-border/70 text-muted-foreground hover:text-bright hover:border-border"
                  }`}
                >
                  {isAr ? "الكل" : "All"}
                </button>
                {activeSubs.map((sub) => {
                  const isSubSelected = subFilter === sub.id;
                  const subCount = items.filter(
                    (i) => i.subcategory_id === sub.id
                  ).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSubFilter(sub.id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5 ${
                        isSubSelected
                          ? "bg-bright text-[hsl(var(--echo-base))] font-semibold"
                          : "border border-border/70 text-muted-foreground hover:text-bright hover:border-border"
                      }`}
                    >
                      <span>{subName(sub)}</span>
                      {subCount > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSubSelected
                              ? "bg-black/20 text-inherit"
                              : "bg-muted/70 text-muted-foreground"
                          }`}
                        >
                          {subCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial State: Prompt user to click a category */}
          {catFilter === null ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-surface/80 via-surface/40 to-surface/10 p-8 sm:p-14 text-center backdrop-blur-xl shadow-2xl my-6"
            >
              {/* Decorative accent glow */}
              <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[hsl(var(--echo-accent))]/10 blur-3xl" />

              {/* Sparkle badge */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[hsl(var(--echo-accent))]/30 bg-[hsl(var(--echo-accent))]/10 text-[hsl(var(--echo-accent))] shadow-inner">
                <Sparkles size={36} className="animate-pulse" />
                <span className="absolute -inset-1 rounded-2xl border border-[hsl(var(--echo-accent))]/20 animate-ping opacity-30" />
              </div>

              {/* Title & guidance */}
              <h2 className="text-2xl sm:text-3xl font-bold text-bright tracking-tight mb-3">
                {isAr ? "اختر فئة لاستعراض الأعمال" : "Select a Category to Explore Works"}
              </h2>
              <p className="mx-auto max-w-lg text-muted-foreground text-sm sm:text-base leading-relaxed mb-10">
                {isAr
                  ? "يرجى الضغط على إحدى الفئات في الأعلى أو الاختيار مباشرة من البطاقات أدناه لعرض المشاريع الخاصة بها"
                  : "Please choose a category from above or click any card below to view its featured projects"}
              </p>

              {/* Quick Interactive Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {categories.map((cat, idx) => {
                  const count = getCategoryCount(cat.id, cat.name_en);

                  return (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * (idx + 1), duration: 0.35 }}
                      onClick={() => selectCategory(cat.id)}
                      className="group relative flex flex-col items-center justify-between p-6 rounded-2xl border border-border/80 bg-surface/80 hover:bg-surface hover:border-[hsl(var(--echo-accent))]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--echo-accent))]/10 cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-muted-foreground group-hover:text-[hsl(var(--echo-accent))] group-hover:bg-[hsl(var(--echo-accent))]/10 transition-colors mb-4">
                        <FolderOpen size={24} />
                      </div>
                      <h3 className="font-semibold text-bright group-hover:text-[hsl(var(--echo-accent))] transition-colors text-lg mb-1">
                        {catName(cat)}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {count} {isAr ? "عمل / مشروع" : "projects"}
                      </span>
                      <div className="mt-4 flex items-center gap-1.5 text-xs text-[hsl(var(--echo-accent))] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{isAr ? "استعراض الأعمال" : "View works"}</span>
                        <ArrowRight
                          size={13}
                          className={`transition-transform duration-200 ${
                            isAr ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                          }`}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : filtered.length === 0 ? (
            /* Empty state when category is selected but has no items */
            <div className="py-24 text-center rounded-3xl border border-dashed border-border/70 my-6">
              <FolderOpen size={40} className="mx-auto text-muted-foreground/60 mb-4" />
              <p className="text-lg font-medium text-bright mb-1">
                {isAr ? "لا توجد أعمال في هذا القسم حالياً" : "No items in this category yet"}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {isAr
                  ? "جرب اختيار فئة أخرى أو استعراض جميع الأعمال"
                  : "Try selecting another category or view all works"}
              </p>
              <button
                onClick={() => selectCategory("all")}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:text-bright hover:border-[hsl(var(--echo-accent))] transition-colors cursor-pointer"
              >
                {isAr ? "عرض جميع الأعمال" : "View all works"}
              </button>
            </div>
          ) : (
            /* Work items Grid */
            <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <StaggerItem key={item.id}>
                  <ScaleOnHover>
                    <div
                      onClick={() => setLightbox(item)}
                      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer"
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
                          <span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur transition-transform duration-500 group-hover:scale-110">
                            <Play size={22} className="ms-0.5 text-white" fill="currentColor" />
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-7">
                        <h3 className="text-xl font-semibold text-white">
                          {isAr ? item.title_ar : item.title_en}
                        </h3>
                        <p className="text-white/70 text-sm mt-1 line-clamp-2">
                          {isAr ? item.description_ar : item.description_en}
                        </p>
                      </div>
                    </div>
                  </ScaleOnHover>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute end-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/75 cursor-pointer"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.media_type === "video" ? (
                <video
                  src={lightbox.media_url}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh] rounded-xl"
                />
              ) : (
                <Image
                  src={lightbox.media_url}
                  alt={isAr ? lightbox.title_ar : lightbox.title_en}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                />
              )}
              <div className="mt-4 text-white">
                <h3 className="text-xl font-semibold">
                  {isAr ? lightbox.title_ar : lightbox.title_en}
                </h3>
                <p className="text-white/70 mt-1">
                  {isAr ? lightbox.description_ar : lightbox.description_en}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
