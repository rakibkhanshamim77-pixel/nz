"use client";

import ReusableImage from "./ReusableImage";
import {
  toBengaliDigits,
  type HeroSlideColor,
  type HeroSlideImage,
} from "./heroSlider.shared";

export interface HeroSliderImageProps {
  /**
   * All slide images, in slide order. They're stacked and cross-faded so switching is instant
   * (every image is already loaded) instead of showing a loading skeleton on each change.
   */
  images: HeroSlideImage[];
  activeIndex: number;
  /** Current slide's discount percentage, e.g. 34 */
  discount?: number;
  /** Current slide's available colors (display only) */
  colors?: HeroSlideColor[];
  featuredLabel?: string;
}

export default function HeroSliderImage({
  images,
  activeIndex,
  discount,
  colors = [],
  featuredLabel = "FEATURED",
}: HeroSliderImageProps) {
  return (
    <div className="order-1 lg:order-2">
      <div className="slide relative isolate aspect-[4/4.2] overflow-hidden rounded-3xl bg-soft shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-line lg:aspect-[4/4.6]">
        {/* Subtle backdrop shown while images load */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.6),transparent_60%)]"
        />

        {images.map((img, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={`${img.src}-${i}`}
              aria-hidden={!isActive}
              className={`absolute inset-0 motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out ${
                isActive
                  ? "z-[1] scale-100 opacity-100"
                  : "z-0 scale-[1.04] opacity-0"
              }`}
            >
              <ReusableImage
                src={img.src}
                alt={isActive ? img.alt : ""}
                fill
                priority={i === 0}
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                skeletonClassName="bg-soft"
              />
            </div>
          );
        })}

        {/* Soft vignette so the badges stay readable on any photo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/15 via-transparent to-black/25"
        />

        <span className="absolute left-4 top-4 z-10 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white backdrop-blur">
          {featuredLabel}
        </span>

        {typeof discount === "number" && discount > 0 && (
          <span
            key={discount}
            className="absolute right-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg"
          >
            -{toBengaliDigits(discount)}%<span className="sr-only"> ছাড়</span>
          </span>
        )}

        {colors.length > 0 && (
          <ul
            aria-label="Available colors"
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur"
          >
            {colors.map((c) => (
              <li key={c.name} title={c.name}>
                <span
                  className="block h-4 w-4 rounded-full border border-white/50"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="sr-only">{c.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
