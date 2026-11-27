"use client";

import { useState, useCallback } from "react";
import ReusableImage from "@/app/(main)/components/hero/ReusableImage";
import { useProductSelection } from "./ProductSelectionProvider";

interface ProductGalleryProps {
  name: string;
  images: string[];
  discount: number;
  isNew?: boolean;
}

export default function ProductGallery({ name, images, discount, isNew }: ProductGalleryProps) {
  const { selectedColor } = useProductSelection();

  const list = selectedColor?.images?.length ? selectedColor.images : images;
  const listKey = list.join("|");

  const [active, setActive] = useState(0);
  const [shownKey, setShownKey] = useState(listKey);
  if (shownKey !== listKey) {
    setShownKey(listKey);
    setActive(0);
  }

  const current = list[Math.min(active, list.length - 1)];

  const goPrev = useCallback(() => setActive((i) => (i - 1 + list.length) % list.length), [list.length]);
  const goNext = useCallback(() => setActive((i) => (i + 1) % list.length), [list.length]);

  return (
    <section className="lg:sticky lg:top-24" aria-label="পণ্যের ছবি">

      {/* ── Mobile gallery: full-bleed edge-to-edge ── */}
      <div className="lg:hidden -mx-4 sm:-mx-6 relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
        {/* Images */}
        {list.map((src, i) => (
          <div
            key={`${src}-${i}`}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-500 ${i === active ? "opacity-100 z-[1]" : "opacity-0 z-0"}`}
          >
            <ReusableImage
              src={src}
              alt={i === active ? (selectedColor ? `${name} — ${selectedColor.name}` : name) : ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              skeletonClassName="bg-soft"
            />
          </div>
        ))}

        {/* Soft bottom gradient so info card blends in */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[2] bg-gradient-to-t from-bg to-transparent" />

        {/* Badges */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 z-10 h-7 px-3 rounded-full bg-red-500 text-white text-xs font-bold grid place-items-center shadow">
            −{discount}%
          </span>
        )}
        {isNew && (
          <span className="absolute top-4 right-4 z-10 h-7 px-3 rounded-full bg-ink text-bg text-xs font-bold grid place-items-center">
            নতুন
          </span>
        )}

        {/* Image counter pill */}
        {list.length > 1 && (
          <span className="absolute top-4 right-4 z-10 h-7 px-3 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold grid place-items-center">
            {active + 1} / {list.length}
          </span>
        )}

        {/* Prev / Next tap areas */}
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="আগের ছবি"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/90 active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M15 6 9 12l6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="পরের ছবি"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/90 active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {list.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`ছবি ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? "w-5 h-1.5 bg-ink" : "w-1.5 h-1.5 bg-ink/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop gallery: sticky card (unchanged) ── */}
      <div className="hidden lg:block">
        <div className="card relative overflow-hidden aspect-square grid place-items-center">
          {discount > 0 && (
            <span className="absolute top-4 left-4 h-8 px-3 rounded-full bg-ink text-bg text-xs font-bold grid place-items-center z-10">
              −{discount}%
            </span>
          )}
          {isNew && (
            <span className="absolute top-4 right-4 h-8 px-3 rounded-full border border-line bg-surface text-xs font-bold grid place-items-center z-10">
              নতুন
            </span>
          )}
          <div className="relative w-full h-full grid place-items-center bg-soft">
            <ReusableImage
              src={current}
              alt={selectedColor ? `${name} — ${selectedColor.name}` : name}
              fill
              priority
              sizes="560px"
              className="object-cover"
              skeletonClassName="bg-soft"
            />
          </div>
        </div>

        {list.length > 1 && (
          <div className="grid grid-cols-3 gap-3 mt-3" role="group" aria-label="ছবি বাছাই করুন">
            {list.map((src, i) => {
              const isActive = i === active;
              return (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`ছবি ${i + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative aspect-square overflow-hidden rounded-2xl bg-soft border-2 transition ${
                    isActive ? "border-ink" : "border-transparent hover:border-line"
                  }`}
                >
                  <ReusableImage src={src} alt="" fill sizes="180px" className="object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
