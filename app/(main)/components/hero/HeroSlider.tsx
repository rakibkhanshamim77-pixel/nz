"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import HeroSliderContent from "./HeroSliderContent";
import HeroSliderImage from "./HeroSliderImage";
import ReusableImage from "./ReusableImage";
import { formatTaka, type HeroSlide } from "./heroSlider.shared";

export interface HeroSliderProps {
  slides: HeroSlide[];
  /** Autoplay delay in ms (default 5000) */
  autoplayDelay?: number;
}

export default function HeroSlider({
  slides,
  autoplayDelay = 5000,
}: HeroSliderProps) {
  const total = slides.length;
  const images = useMemo(() => slides.map((s) => s.image), [slides]);
  const titles = useMemo(() => slides.map((s) => s.title), [slides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  const currentIndex = total > 0 ? Math.min(activeIndex, total - 1) : 0;

  const isPaused = isHovered || hasKeyboardFocus || isTabHidden;
  const isAutoplaying = total > 1 && !isPaused;

  const wrap = useCallback(
    (i: number) => (total > 0 ? ((i % total) + total) % total : 0),
    [total],
  );

  useEffect(() => {
    if (!isAutoplaying) return;
    const id = window.setTimeout(
      () => setActiveIndex((i) => wrap(i + 1)),
      autoplayDelay,
    );
    return () => window.clearTimeout(id);
  }, [currentIndex, timerKey, isAutoplaying, autoplayDelay, wrap]);

  useEffect(() => {
    const onVisibility = () =>
      setIsTabHidden(document.visibilityState === "hidden");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(wrap(index));
      setTimerKey((k) => k + 1);
    },
    [wrap],
  );

  const goNext = useCallback(() => {
    setActiveIndex((i) => wrap(i + 1));
    setTimerKey((k) => k + 1);
  }, [wrap]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => wrap(i - 1));
    setTimerKey((k) => k + 1);
  }, [wrap]);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (total < 2) return;
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
  };

  const handleFocus = (e: FocusEvent<HTMLElement>) => {
    try {
      if ((e.target as HTMLElement).matches(":focus-visible")) setHasKeyboardFocus(true);
    } catch { setHasKeyboardFocus(true); }
  };

  const handleBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
      setHasKeyboardFocus(false);
  };

  if (total === 0) return null;

  const slide = slides[currentIndex];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {/* ── Mobile hero: full-screen image with text overlay ── */}
      <div className="lg:hidden relative overflow-hidden" style={{ height: "calc(100dvh - 56px - 56px)" }}>
        {/* Background images — cross-faded */}
        {images.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === currentIndex ? "opacity-100 z-[1]" : "opacity-0 z-0"
            }`}
          >
            <ReusableImage
              src={img.src}
              alt={i === currentIndex ? img.alt : ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              skeletonClassName="bg-soft"
            />
          </div>
        ))}

        {/* Gradient overlay — dark at bottom, slight dark at top */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/85 via-black/20 to-black/15" />

        {/* Top: badge + dot navigation */}
        <div className="absolute top-4 inset-x-4 z-[3] flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-white bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
            {slide.badge || "NEW ARRIVAL"}
          </span>
          {total > 1 && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: total }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-5 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom: content */}
        <div className="absolute inset-x-0 bottom-0 z-[3] px-5 pb-6">
          <h1 className="font-display font-extrabold text-[2rem] leading-tight tracking-tight text-white mb-1">
            {slide.title}
          </h1>
          <p className="text-sm text-white/70 mb-5 leading-relaxed line-clamp-2">
            {slide.description}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/product/${slide.slug}`}
              className="inline-flex h-11 items-center gap-2 px-6 rounded-full bg-white text-black font-semibold text-sm shadow-lg active:scale-95 transition-transform"
            >
              এখনই কিনুন
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <div className="text-white">
              {slide.regularPrice > slide.salePrice && (
                <s className="text-xs text-white/50 block">{formatTaka(slide.regularPrice)}</s>
              )}
              <span className="font-display font-bold text-xl">{formatTaka(slide.salePrice)}</span>
            </div>
          </div>
        </div>

        {/* Prev/Next swipe buttons (subtle, on the sides) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[3] w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M15 6 9 12l6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-[3] w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Desktop hero: 2-column grid (unchanged) ── */}
      <div className="hidden lg:block mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-14">
        <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <HeroSliderContent
            slide={slide}
            activeIndex={currentIndex}
            total={total}
            slideTitles={titles}
            isAutoplaying={isAutoplaying}
            onPrev={goPrev}
            onNext={goNext}
            onGoTo={goTo}
          />
          <HeroSliderImage
            images={images}
            activeIndex={currentIndex}
            discount={slide.discount}
            colors={slide.colors}
          />
        </div>
      </div>
    </section>
  );
}
