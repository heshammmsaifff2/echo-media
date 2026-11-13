"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { artHouse } from "@/lib/brand";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  LineReveal,
} from "@/components/motion";
import { MediaPanel } from "@/components/media-panel";
import { useSection } from "@/components/content-provider";
import { CtaSection } from "@/components/sections/closing";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Images,
  Video,
  Sparkles,
} from "lucide-react";

type Item = { name: string; body: string };

function useItems(
  override: { en: Record<string, string>[]; ar: Record<string, string>[] } | null,
  isAr: boolean,
  fallback: readonly { name: { en: string; ar: string }; body: { en: string; ar: string } }[]
): Item[] {
  if (override) {
    const arr = isAr ? override.ar : override.en;
    if (Array.isArray(arr) && arr.length) {
      return arr.map((r) => ({ name: r.name ?? "", body: r.body ?? "" }));
    }
  }
  return fallback.map((i) => ({
    name: isAr ? i.name.ar : i.name.en,
    body: isAr ? i.body.ar : i.body.en,
  }));
}

const DEFAULT_GALLERY_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600",
    title_ar: "البلاتوه الرئيسي ومنظومة الإضاءة العلوية",
    title_en: "Main Production Bay & Overhead Lighting Grid",
  },
  {
    url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1600",
    title_ar: "استوديو البودكاست المعالج صوتياً بالكامل",
    title_en: "Fully Treated Acoustic Podcast Studio",
  },
  {
    url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600",
    title_ar: "كاميرات السينما وعدسات البرايم فائقة الدقة",
    title_en: "Cinema Prime Lenses & Full-Frame Rigging",
  },
  {
    url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1600",
    title_ar: "جناح المونتاج والتصحيح اللوني DaVinci",
    title_en: "DaVinci Resolve Color Grading & Editing Suite",
  },
  {
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600",
    title_ar: "كابينة التعليق الصوتي والدبلجة الاحترافية",
    title_en: "Isolated Voiceover & Dubbing Booth",
  },
  {
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600",
    title_ar: "بلاتوه السيكلو الأبيض لتصوير الإعلانات والمنتجات",
    title_en: "Seamless Infinity Cyclorama for Commercials",
  },
  {
    url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600",
    title_ar: "غرفة الكنترول والمراقبة المباشرة",
    title_en: "Multi-Channel Live Video Switcher & Control Room",
  },
  {
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600",
    title_ar: "صالة استراحة الضيوف وشاشات المراجعة الفورية",
    title_en: "Client Lounge & High-Definition Playback Monitor",
  },
  {
    url: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1600",
    title_ar: "شبكة سوفت بوكس وموزعات الإضاءة الناعمة",
    title_en: "Diffused Softbox Network & Studio Grip Gear",
  },
  {
    url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1600",
    title_ar: "طاولة البودكاست وتوزيع الميكروفونات الإذاعية",
    title_en: "Three-Angle Discussion Set & Broadcast Microphones",
  },
  {
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1600",
    title_ar: "قسم معدات التثبيت وحوامل الكاميرا والجيمبال",
    title_en: "Gimbal & Motion Stabilization Rigging Section",
  },
  {
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1600",
    title_ar: "ستائر البلاك أوت المعتمة لعزل الإضاءة تماماً",
    title_en: "Blackout Studio Drapes & Atmospheric Control",
  },
];

export function ArtHouseContent() {
  const { pick, isAr } = useI18n();

  const heroS = useSection("studio.hero");
  const introS = useSection("studio.intro");
  const offerS = useSection("studio.offer");
  const galleryS = useSection("studio.gallery");
  const videoS = useSection("studio.video");

  const offerItems = useItems(offerS.field("items", null), isAr, artHouse.offer.items);

  // Gallery carousel state
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<(typeof DEFAULT_GALLERY_IMAGES)[0] | null>(null);

  // Controllable video state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const videoUrl =
    videoS.bg?.url ||
    "https://res.cloudinary.com/ai39ujhm/video/upload/echo/site/final.mp4";
  const videoPoster =
    videoS.bg?.poster ||
    "https://res.cloudinary.com/ai39ujhm/image/upload/echo/site/posters/final.jpg";

  const galleryHeading = pick(
    galleryS.field("heading", {
      en: "Art House Spaces",
      ar: "مساحات استوديو آرت هاوس",
    })
  );
  const gallerySubtitle = pick(
    galleryS.field("subtitle", {
      en: "A visual tour inside our sound-treated studios, production sets, and cinema camera bays.",
      ar: "جولة بصرية حية داخل بلاتوهات التصوير، غرف الصوت المعالجة، وأجنحة الكاميرات السينمائية.",
    })
  );

  const videoHeading = pick(
    videoS.field("heading", {
      en: "Experience the Space in Motion",
      ar: "عش تجربة المساحة في حركة حية",
    })
  );
  const videoBody = pick(
    videoS.field("body", {
      en: "Take an immersive tour through our sets, lighting grids, and editing suites.",
      ar: "جولة سينمائية غامرة داخل البلاتوهات ومنظومات الإضاءة وجناح المونتاج المجهز.",
    })
  );

  const scrollCarousel = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const offset = direction === "left" ? -420 : 420;
    scrollContainerRef.current.scrollBy({
      left: isAr ? -offset : offset,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const itemWidth = 380;
    const current = Math.round(Math.abs(el.scrollLeft) / itemWidth);
    setActiveImageIndex(Math.min(DEFAULT_GALLERY_IMAGES.length - 1, Math.max(0, current)));
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current && Number.isFinite(val)) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Hero — the space, full-bleed media */}
      <MediaPanel
        bg={heroS.bg}
        label="Art House Studio"
        overlay="default"
        align="bottom"
        minH="screen"
        contentClassName="pt-32"
        priority
      >
        <p className="eyebrow mb-8 text-bright/70">{pick(heroS.field("eyebrow", artHouse.eyebrow))}</p>
        <h1 className="display-xl text-bright drop-shadow-[0_2px_40px_rgba(0,0,0,0.55)]">
          <LineReveal lines={[pick(heroS.field("title", artHouse.title))]} delay={0.15} />
        </h1>
        <p className="mt-8 max-w-2xl text-xl text-foreground sm:text-2xl">
          {pick(heroS.field("subtitle", artHouse.subtitle))}
        </p>
      </MediaPanel>

      {/* The pitch — one large statement over media */}
      <MediaPanel bg={introS.bg} label="The space" overlay="strong" align="center" minH="large">
        <FadeIn>
          <p className="display-md max-w-5xl text-bright drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)]">
            {pick(introS.field("body", artHouse.body))}
          </p>
        </FadeIn>
      </MediaPanel>

      {/* What the studio offers */}
      <section className="border-t border-border bg-background py-28 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mb-14 flex items-center gap-6">
            <span className="eyebrow whitespace-nowrap">
              {pick(offerS.field("heading", artHouse.offer.heading))}
            </span>
            <span className="rule" />
          </div>

          <StaggerContainer className="flex flex-col gap-10 sm:gap-14" staggerDelay={0.07}>
            {offerItems.map((item, i) => (
              <StaggerItem key={i}>
                <div className={`flex flex-col gap-2 sm:max-w-3xl ${i % 2 === 1 ? "sm:ms-auto sm:text-end" : ""}`}>
                  <span className="font-mono text-sm text-[hsl(var(--echo-accent))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-3xl font-bold leading-none text-bright sm:text-5xl">
                    {item.name}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Studio Controllable Video (Managed via Admin) ───────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#020510] py-28 sm:py-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full -z-10"
          style={{
            background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(14,165,233,0.03) 50%, transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 mb-5">
                <Video size={14} className="text-sky-400" />
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-widest">
                  {isAr ? "فيديو الاستوديو التفاعلي" : "Studio In Action"}
                </span>
              </div>
              <h2 className="display-md text-bright text-balance">
                {videoHeading}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground text-balance">
                {videoBody}
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.15}>
            <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/20 bg-black/80 overflow-hidden shadow-2xl group">
              <div className="relative aspect-video w-full bg-black">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={videoPoster}
                  playsInline
                  muted={isMuted}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                    }
                  }}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />

                {/* Big Center Play Button when paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={toggleVideoPlay}
                    aria-label="Play Video"
                    className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[2px] transition-all hover:bg-black/30 cursor-pointer"
                  >
                    <span className="grid h-20 w-20 place-items-center rounded-full border border-white/30 bg-sky-500 text-black shadow-2xl transition-transform hover:scale-110">
                      <Play size={32} className="translate-x-0.5 fill-current" />
                    </span>
                  </button>
                )}

                {/* Custom Video Controls Bar */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-3 z-20">
                  {/* Timeline Scrubber */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleVideoPlay}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={toggleVideoMute}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>

                      <span className="font-mono text-[11px] text-white/70">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen().catch(() => {});
                            } else {
                              videoRef.current.requestFullscreen().catch(() => {});
                            }
                          }
                        }}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                        title={isAr ? "ملء الشاشة" : "Fullscreen"}
                      >
                        <Maximize2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Studio Image Carousel Gallery (Replacing equipment section) ── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#01040f] py-28 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 mb-4">
                <Images size={14} className="text-sky-400" />
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-widest">
                  {isAr ? "معرض المساحات" : "Spaces Gallery"}
                </span>
              </div>
              <h2 className="display-md text-bright text-balance">
                {galleryHeading}
              </h2>
              <p className="mt-3 text-base text-muted-foreground max-w-2xl text-balance">
                {gallerySubtitle}
              </p>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-end">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                aria-label={isAr ? "السابق" : "Previous"}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/15 hover:border-sky-400/50 transition-all cursor-pointer shadow-md"
              >
                <ChevronLeft size={20} className={isAr ? "rotate-180" : ""} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                aria-label={isAr ? "التالي" : "Next"}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/15 hover:border-sky-400/50 transition-all cursor-pointer shadow-md"
              >
                <ChevronRight size={20} className={isAr ? "rotate-180" : ""} />
              </button>
            </div>
          </div>

          {/* Smooth Scrollable Horizontal Image Carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-5 overflow-x-auto pb-8 pt-2 scroll-smooth no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {DEFAULT_GALLERY_IMAGES.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage(img)}
                className="group relative h-[420px] w-[320px] sm:w-[380px] shrink-0 rounded-2xl overflow-hidden border border-white/15 bg-surface/90 shadow-xl cursor-pointer snap-start transition-all duration-300 hover:border-sky-400/60 hover:-translate-y-1"
              >
                <Image
                  src={img.url}
                  alt={isAr ? img.title_ar : img.title_en}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="380px"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-4 end-4 z-10">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={15} />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                  <span className="font-mono text-[10px] text-sky-400 uppercase tracking-widest">
                    PHOTO {String(idx + 1).padStart(2, "0")} / {DEFAULT_GALLERY_IMAGES.length}
                  </span>
                  <h3 className="text-base font-semibold text-white mt-1 line-clamp-2">
                    {isAr ? img.title_ar : img.title_en}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Image count tracker */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/10">
            <span className="font-mono">
              {String(activeImageIndex + 1).padStart(2, "0")} / {DEFAULT_GALLERY_IMAGES.length} {isAr ? "صورة استوديو" : "studio photos"}
            </span>
            <span className="text-[11px] text-sky-400">
              {isAr ? "اضغط على أي صورة لتكبيرها" : "Click any photo to enlarge"}
            </span>
          </div>

        </div>
      </section>

      {/* ── Lightbox Modal for Gallery Images ─────────────────────────── */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 end-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[16/10] sm:aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black">
              <Image
                src={lightboxImage.url}
                alt={isAr ? lightboxImage.title_ar : lightboxImage.title_en}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <h4 className="text-lg font-bold text-white">
                {isAr ? lightboxImage.title_ar : lightboxImage.title_en}
              </h4>
            </div>
          </div>
        </div>
      )}

      <CtaSection />
    </>
  );
}
