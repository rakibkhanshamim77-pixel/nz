"use client";

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
import type { HeroSlide } from "./heroSlider.shared";

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
  // Bumped on every manual navigation so the autoplay timer restarts (even when clicking the active dot)
  const [timerKey, setTimerKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  // Guard against the slide list shrinking (e.g. after revalidation)
  const currentIndex = total > 0 ? Math.min(activeIndex, total - 1) : 0;

  const isPaused = isHovered || hasKeyboardFocus || isTabHidden;
  const isAutoplaying = total > 1 && !isPaused;

  const wrap = useCallback(
    (i: number) => (total > 0 ? ((i % total) + total) % total : 0),
    [total],
  );

  // One timeout per slide: re-armed on slide change, manual navigation or pause change; cleared on unmount
  useEffect(() => {
    if (!isAutoplaying) return;
    const id = window.setTimeout(
      () => setActiveIndex((i) => wrap(i + 1)),
      autoplayDelay,
    );
    return () => window.clearTimeout(id);
  }, [currentIndex, timerKey, isAutoplaying, autoplayDelay, wrap]);

  // Don't advance while the browser tab is in the background
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
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
  };

  // Pause only for keyboard focus; a mouse click on Prev/Next shouldn't freeze autoplay
  const handleFocus = (e: FocusEvent<HTMLElement>) => {
    try {
      if ((e.target as HTMLElement).matches(":focus-visible"))
        setHasKeyboardFocus(true);
    } catch {
      setHasKeyboardFocus(true);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
      setHasKeyboardFocus(false);
  };

  if (total === 0) return null;

  const slide = slides[currentIndex];

  return (
    <section
      className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-14"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
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
    </section>
  );
}
