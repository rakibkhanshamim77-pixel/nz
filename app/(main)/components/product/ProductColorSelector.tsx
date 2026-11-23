"use client";

import { useProductSelection } from "./ProductSelectionProvider";

export default function ProductColorSelector() {
  const { colors, colorIndex, selectedColor, selectColor } = useProductSelection();

  if (colors.length === 0) return null;

  return (
    <div>
      <p className="text-sm mb-3">
        <span className="font-semibold">রং:</span> <span className="text-mute">{selectedColor?.name}</span>
      </p>
      <div className="flex items-center gap-3" role="radiogroup" aria-label="রং বাছাই করুন">
        {colors.map((color, i) => {
          const isActive = i === colorIndex;
          return (
            <button
              key={`${color.name}-${i}`}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={color.name}
              title={color.name}
              onClick={() => selectColor(i)}
              className={`w-9 h-9 rounded-full grid place-items-center transition ring-offset-2 ring-offset-bg ${
                isActive ? "ring-2 ring-ink" : "ring-1 ring-line hover:ring-ink/50"
              }`}
            >
              <span className="w-7 h-7 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
