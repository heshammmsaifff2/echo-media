"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Play } from "lucide-react";

type PortfolioItem = {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  media_url: string;
  thumbnail_url: string | null;
  media_type: string;
};

const CATEGORIES = [
  { value: "all", labelEn: "All", labelAr: "الكل" },
  { value: "reels", labelEn: "Reels", labelAr: "ريلز" },
  { value: "video", labelEn: "Video", labelAr: "فيديو" },
  { value: "podcasts", labelEn: "Podcasts", labelAr: "بودكاست" },
  { value: "photos", labelEn: "Photos", labelAr: "صور" },
];

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const { isAr } = useI18n();
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <>
      <section className="pt-40 pb-28 sm:pt-48 sm:pb-36">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <FadeIn className="mb-14">
            <h1 className="display-lg text-bright">
              {isAr ? "أعمالنا" : "Our Work"}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {isAr
                ? "استعرض مشاريعنا في إنتاج الفيديو والتصوير والبودكاست"
                : "Browse our projects in video production, photography, and podcasts"}
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="mb-14 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 cursor-pointer ${
                  filter === cat.value
                    ? "bg-[hsl(var(--echo-accent))] text-[hsl(var(--echo-base))]"
                    : "border border-border text-muted-foreground hover:border-[hsl(var(--echo-accent))] hover:text-bright"
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </FadeIn>

          {filtered.length === 0 ? (
            <div className="py-20 text-muted-foreground">
              {isAr ? "لا توجد أعمال بعد في هذا القسم" : "No items in this category yet"}
            </div>
          ) : (
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
