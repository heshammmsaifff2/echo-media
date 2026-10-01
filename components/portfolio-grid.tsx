"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Play, Sparkles, FolderOpen, ArrowRight, LayoutGrid } from "lucide-react";

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
  initialCategory = null,
}: {
  items: PortfolioItem[];
  categories: Category[];
  subcategories: Subcategory[];
  initialCategory?: string | null;
}) {
  const { isAr } = useI18n();
  // Initially null so the user is prompted to select a category first, unless initialCategory is provided
  const [catFilter, setCatFilter] = useState<string | null>(initialCategory ?? null);
  const [subFilter, setSubFilter] = useState<string>("all");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);

  const catName = (c: Category) => (isAr ? c.name_ar || c.name_en : c.name_en || c.name_ar);
  const subName = (s: Subcategory) => (isAr ? s.name_ar || s.name_en : s.name_en || s.name_ar);

  const getItemTitle = (item: PortfolioItem) => {
    const ar = item.title_ar?.trim();
    const en = item.title_en?.trim();
    return isAr ? (ar || en || "") : (en || ar || "");
  };

  const getItemDesc = (item: PortfolioItem) => {
    const ar = item.description_ar?.trim();
    const en = item.description_en?.trim();
    return isAr ? (ar || en || "") : (en || ar || "");
  };

  const itemMatchesCategory = (item: PortfolioItem, catId: string | null) => {
    if (!catId || catId === "all") return true;
    if (item.category_id === catId) return true;
    const catObj = categories.find((c) => c.id === catId);
    if (!catObj || !item.category) return false;
    const raw = item.category.trim().toLowerCase();
    const en = (catObj.name_en || "").trim().toLowerCase();
    const ar = (catObj.name_ar || "").trim().toLowerCase();
    return (en !== "" && raw === en) || (ar !== "" && raw === ar);
  };

  const getCategoryCount = (catId: string) => {
    return items.filter((i) => itemMatchesCategory(i, catId)).length;
  };

  const activeSubs =
    !catFilter || catFilter === "all"
      ? []
      : subcategories.filter((s) => s.category_id === catFilter);

  const uncategorizedSubCount =
    !catFilter || catFilter === "all"
      ? 0
      : items.filter((i) => itemMatchesCategory(i, catFilter) && !i.subcategory_id).length;

  const filtered =
    catFilter === null
      ? []
      : items.filter((i) => {
          if (catFilter !== "all" && !itemMatchesCategory(i, catFilter)) {
            return false;
          }
          if (subFilter === "none") {
            if (i.subcategory_id) return false;
          } else if (subFilter !== "all") {
            if (i.subcategory_id !== subFilter) return false;
          }
          return true;
        });

  const selectCategory = (id: string | null) => {
    if (catFilter === id) {
      // Toggle back to category cards view if clicked again
      setCatFilter(null);
    } else {
      setCatFilter(id);
    }
    setSubFilter("all");
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
            {/* View Categories Cards Button */}
            <button
              onClick={() => {
                setCatFilter(null);
                setSubFilter("all");
              }}
              className={`group rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer inline-flex items-center gap-2 ${
                catFilter === null
                  ? "bg-white text-black font-semibold shadow-md"
                  : "border border-dashed border-border/80 text-muted-foreground hover:border-[hsl(var(--echo-accent))]/60 hover:text-bright"
              }`}
              title={isAr ? "عرض بطاقات الفئات" : "View Category Cards"}
            >
              <LayoutGrid size={15} />
              <span>{isAr ? "الفئات" : "Categories"}</span>
            </button>

            {categories.map((cat) => {
              const isSelected = catFilter === cat.id;
              const count = getCategoryCount(cat.id);

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
              className={`group rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer inline-flex items-center gap-2 ${
                catFilter === "all"
                  ? "bg-[hsl(var(--echo-accent))] text-[hsl(var(--echo-base))] font-semibold shadow-lg shadow-[hsl(var(--echo-accent))]/25 scale-[1.02]"
                  : "border border-border text-muted-foreground hover:border-[hsl(var(--echo-accent))]/60 hover:text-bright"
              }`}
            >
              <span>{isAr ? "جميع الأعمال" : "All Works"}</span>
              {items.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    catFilter === "all"
                      ? "bg-black/20 text-inherit font-bold"
                      : "bg-muted text-muted-foreground group-hover:text-bright"
                  }`}
                >
                  {items.length}
                </span>
              )}
            </button>
          </FadeIn>

          {/* Subcategories Selector Bar (shown when category is selected and has subcategories or unassigned items) */}
          <AnimatePresence mode="wait">
            {catFilter && catFilter !== "all" && (activeSubs.length > 0 || uncategorizedSubCount > 0) && (
              <motion.div
                key={catFilter}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-10 flex flex-wrap items-center gap-2 border-y border-border/40 py-3.5"
              >
                <span className="text-xs text-muted-foreground font-medium me-1">
                  {isAr ? "الفرع:" : "Subcategory:"}
                </span>
                <button
                  onClick={() => setSubFilter("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5 ${
                    subFilter === "all"
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "border border-border/70 text-muted-foreground hover:text-bright hover:border-border"
                  }`}
                >
                  <span>{isAr ? "الكل" : "All"}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      subFilter === "all"
                        ? "bg-black/15 text-black font-bold"
                        : "bg-muted/70 text-muted-foreground"
                    }`}
                  >
                    {getCategoryCount(catFilter)}
                  </span>
                </button>
                {activeSubs.map((sub) => {
                  const isSubSelected = subFilter === sub.id;
                  const subCount = items.filter(
                    (i) => itemMatchesCategory(i, catFilter) && i.subcategory_id === sub.id
                  ).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSubFilter(sub.id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5 ${
                        isSubSelected
                          ? "bg-white text-black font-semibold shadow-sm"
                          : "border border-border/70 text-muted-foreground hover:text-bright hover:border-border"
                      }`}
                    >
                      <span>{subName(sub)}</span>
                      {subCount > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSubSelected
                              ? "bg-black/15 text-black font-bold"
                              : "bg-muted/70 text-muted-foreground"
                          }`}
                        >
                          {subCount}
                        </span>
                      )}
                    </button>
                  );
                })}
                {/* Other/General filter pill if some items in this category lack subcategory */}
                {uncategorizedSubCount > 0 && activeSubs.length > 0 && (
                  <button
                    onClick={() => setSubFilter("none")}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5 ${
                      subFilter === "none"
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "border border-border/70 text-muted-foreground hover:text-bright hover:border-border"
                    }`}
                  >
                    <span>{isAr ? "أخرى / عام" : "Other / General"}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        subFilter === "none"
                          ? "bg-black/15 text-black font-bold"
                          : "bg-muted/70 text-muted-foreground"
                      }`}
                    >
                      {uncategorizedSubCount}
                    </span>
                  </button>
                )}
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
                  const count = getCategoryCount(cat.id);

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
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => selectCategory("all")}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:text-bright hover:border-[hsl(var(--echo-accent))] transition-colors cursor-pointer"
                >
                  {isAr ? "عرض جميع الأعمال" : "View all works"}
                </button>
                <button
                  onClick={() => {
                    setCatFilter(null);
                    setSubFilter("all");
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-5 py-2 text-sm text-muted-foreground hover:text-bright hover:bg-muted transition-colors cursor-pointer"
                >
                  <FolderOpen size={14} />
                  {isAr ? "الرجوع لاختيار الفئات" : "Back to categories"}
                </button>
              </div>
            </div>
          ) : (
            /* Work items Grid */
            <StaggerContainer
              key={`${catFilter}-${subFilter}`}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((item) => {
                const title = getItemTitle(item);
                const desc = getItemDesc(item);

                return (
                  <StaggerItem key={item.id}>
                    <ScaleOnHover>
                      <div
                        onClick={() => setLightbox(item)}
                        className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer"
                      >
                        {item.thumbnail_url || item.media_type === "image" ? (
                          <Image
                            src={item.thumbnail_url || item.media_url}
                            alt={title || "Portfolio Item"}
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
                          {title && (
                            <h3 className="text-xl font-semibold text-white">
                              {title}
                            </h3>
                          )}
                          {desc && (
                            <p className="text-white/70 text-sm mt-1 line-clamp-2">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </ScaleOnHover>
                  </StaggerItem>
                );
              })}
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
                  alt={getItemTitle(lightbox) || "Portfolio"}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                />
              )}
              {(getItemTitle(lightbox) || getItemDesc(lightbox)) && (
                <div className="mt-4 text-white">
                  {getItemTitle(lightbox) && (
                    <h3 className="text-xl font-semibold">
                      {getItemTitle(lightbox)}
                    </h3>
                  )}
                  {getItemDesc(lightbox) && (
                    <p className="text-white/70 mt-1">
                      {getItemDesc(lightbox)}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
