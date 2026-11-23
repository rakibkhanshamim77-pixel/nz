"use client";

import { useProductSelection } from "./ProductSelectionProvider";

interface ProductSizeSelectorProps {
  hasSizeChart: boolean;
}

export default function ProductSizeSelector({ hasSizeChart }: ProductSizeSelectorProps) {
  const { sizes, selectedSize, selectSize, isSoldOut } = useProductSelection();

  if (sizes.length === 0) return null;

  let stockNote = "";
  if (isSoldOut) stockNote = "এই পণ্যটি এখন স্টকে নেই।";
  else if (selectedSize && selectedSize.stock <= 5) stockNote = `⚡ ${selectedSize.label} সাইজে মাত্র ${selectedSize.stock.toLocaleString("bn-BD")}টি বাকি`;
  else if (selectedSize) stockNote = "✓ স্টকে আছে";

  return (
    <div className="mt-6 scroll-mt-24" id="size-picker">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm">
          <span className="font-semibold">সাইজ:</span>{" "}
          <span className="text-mute">{selectedSize?.label ?? "বাছাই করুন"}</span>
        </p>
        {hasSizeChart && (
          <a
            href="#sizeChart"
            onClick={() => {
              // Open the size chart <details> before the browser scrolls to it
              const chart = document.getElementById("sizeChart");
              if (chart instanceof HTMLDetailsElement) chart.open = true;
            }}
            className="text-sm font-semibold underline underline-offset-4 inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 8h18v8H3z" />
              <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
            </svg>
            সাইজ চার্ট
          </a>
        )}
      </div>

      <div className="size-row flex flex-wrap gap-2" role="radiogroup" aria-label="সাইজ বাছাই করুন">
        {sizes.map((size) => {
          const isActive = selectedSize?.label === size.label;
          const unavailable = size.stock <= 0;
          return (
            <button
              key={size.label}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={unavailable ? `${size.label} — স্টকে নেই` : size.label}
              disabled={unavailable}
              onClick={() => selectSize(size.label)}
              className={`min-w-[52px] h-11 px-4 rounded-xl border font-semibold transition ${
                isActive
                  ? "bg-ink text-bg border-ink"
                  : unavailable
                    ? "border-line text-mute line-through opacity-50 cursor-not-allowed"
                    : "border-line hover:border-ink"
              }`}
            >
              {size.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm mt-3 min-h-5" aria-live="polite">
        {stockNote}
      </p>
    </div>
  );
}
