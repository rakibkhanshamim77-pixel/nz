"use client";

import { useState } from "react";
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

  // Color-specific images when the selected color has them, otherwise the product images
  const list = selectedColor?.images?.length ? selectedColor.images : images;
  const listKey = list.join("|");

  const [active, setActive] = useState(0);
  const [shownKey, setShownKey] = useState(listKey);
  if (shownKey !== listKey) {
    // Color changed → start from the first image of the new set
    setShownKey(listKey);
    setActive(0);
  }

  const current = list[Math.min(active, list.length - 1)];

  return (
    <section className="lg:sticky lg:top-24" aria-label="পণ্যের ছবি">
      <div className="card relative overflow-hidden aspect-[4/5] sm:aspect-square grid place-items-center">
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
            sizes="(min-width: 1024px) 560px, 100vw"
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
                <ReusableImage src={src} alt="" fill sizes="(min-width: 1024px) 180px, 33vw" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
