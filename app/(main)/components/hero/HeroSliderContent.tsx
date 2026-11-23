"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatTaka, type HeroSlide } from "./heroSlider.shared";

export interface HeroSliderContentProps {
  slide: HeroSlide;
  activeIndex: number;
  total: number;
  /** Used for the dots' accessible labels */
  slideTitles: string[];
  /** When autoplaying, screen-reader announcements are muted (WAI-ARIA carousel guidance) */
  isAutoplaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function HeroSliderContent({
  slide,
  activeIndex,
  total,
  slideTitles,
  isAutoplaying,
  onPrev,
  onNext,
  onGoTo,
}: HeroSliderContentProps) {
  // Fade/slide-in whenever the slide changes. Starts visible so server-rendered text shows without waiting for JS.
  const [shownId, setShownId] = useState(slide.id);
  const [visible, setVisible] = useState(true);

  if (slide.id !== shownId) {
    // Adjusting state during render (React-recommended) avoids a one-frame flash of the new text
    setShownId(slide.id);
    setVisible(false);
  }

  useEffect(() => {
    if (visible) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [visible]);

  const features = Array.isArray(slide.features) ? slide.features : [];
  const savings = slide.regularPrice - slide.salePrice;

  return (
    <div className="order-2 lg:order-1">
      <div
        role="group"
        aria-roledescription="slide"
        aria-label={`${activeIndex + 1} of ${total}`}
        className={
          visible
            ? "translate-y-0 opacity-100 motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out"
            : "opacity-0 motion-safe:translate-y-3"
        }
      >
        <span className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-1.5 text-sm text-mute">
          <span
            className="h-1.5 w-1.5 rounded-full bg-teal"
            aria-hidden="true"
          />
          {slide.badge}
        </span>

        <h1 className="mb-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {slide.title}
        </h1>

        <p className="mb-6 max-w-md leading-relaxed text-mute">
          {slide.description}
        </p>

        {features.length > 0 && (
          <ul className="mb-7 space-y-2.5 text-[15px]">
            {features.map((ft) => (
              <li className="flex items-center gap-3" key={ft}>
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
                  aria-hidden="true"
                />
                {ft}
              </li>
            ))}
          </ul>
        )}

        <div className="mb-7 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {savings > 0 && (
            <s className="text-lg text-mute">
              <span className="sr-only">আগের দাম: </span>
              {formatTaka(slide.regularPrice)}
            </s>
          )}
          <b className="font-display text-3xl">
            <span className="sr-only">অফার মূল্য: </span>
            {formatTaka(slide.salePrice)}
          </b>
          {savings > 0 && (
            <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
              সাশ্রয় {formatTaka(savings)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/product/${slide.slug}`}
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-7 font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            এখনই কিনুন
            <svg
              className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-9 flex items-center justify-between border-t border-line pt-6">
        <span className="text-sm tabular-nums" aria-hidden="true">
          <b>{pad(activeIndex + 1)}</b>
          <span className="text-mute"> / {pad(total)}</span>
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous slide"
            className="grid h-10 w-10 place-items-center rounded-full border border-line transition-colors hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m15 5-7 7 7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next slide"
            className="grid h-10 w-10 place-items-center rounded-full border border-line transition-colors hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dots */}
      <div
        className="mt-5 flex items-center gap-2"
        role="group"
        aria-label="Choose slide"
      >
        {Array.from({ length: total }, (_, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onGoTo(i)}
              aria-label={`Go to slide ${i + 1}${slideTitles[i] ? `: ${slideTitles[i]}` : ""}`}
              aria-current={isActive ? "true" : undefined}
              className="group grid h-6 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <span
                className={`block h-2 rounded-full motion-safe:transition-all motion-safe:duration-500 ${
                  isActive ? "w-8 bg-ink" : "w-2 bg-line group-hover:bg-ink/40"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Screen-reader announcement on manual navigation */}
      <p
        className="sr-only"
        aria-live={isAutoplaying ? "off" : "polite"}
        aria-atomic="true"
      >
        Slide {activeIndex + 1} of {total}: {slide.title}
      </p>
    </div>
  );
}
