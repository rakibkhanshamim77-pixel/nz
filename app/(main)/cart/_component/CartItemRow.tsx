"use client";

import Image from "next/image";
import type { CartItem } from "@/lib/cart";

interface Props {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}

function fmt(n: number) {
  return "BDT " + n.toLocaleString("en-US");
}

function QtyControl({
  qty,
  onInc,
  onDec,
}: {
  qty: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="কমান"
        onClick={onDec}
        className="w-8 h-8 rounded-l-xl border border-line flex items-center justify-center text-mute hover:text-ink hover:bg-soft transition-colors"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="w-9 h-8 border-t border-b border-line flex items-center justify-center text-sm font-semibold select-none">
        {qty}
      </span>
      <button
        type="button"
        aria-label="বাড়ান"
        onClick={onInc}
        disabled={qty >= 20}
        className="w-8 h-8 rounded-r-xl border border-line flex items-center justify-center text-mute hover:text-ink hover:bg-soft transition-colors disabled:opacity-40"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

export default function CartItemRow({ item, onUpdateQty, onRemove }: Props) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="py-5 first:pt-0 last:pb-0 sm:grid sm:grid-cols-[minmax(0,1fr)_120px_110px] sm:gap-4 sm:items-center">
      {/* Product info */}
      <div className="flex items-start gap-3.5">
        <div className="shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-soft">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[15px] leading-snug line-clamp-2">
            {item.name}
          </p>
          {(item.size || item.color) && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {item.size && (
                <span className="text-xs text-mute bg-soft rounded-full px-2 py-0.5">
                  সাইজ: {item.size}
                </span>
              )}
              {item.color && (
                <span className="flex items-center gap-1 text-xs text-mute">
                  {item.colorHex && (
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-line"
                      style={{ background: item.colorHex }}
                    />
                  )}
                  {item.color}
                </span>
              )}
            </div>
          )}
          <p className="text-sm text-mute mt-1">{fmt(item.unitPrice)} / পিস</p>

          {/* Mobile: qty controls + price + remove */}
          <div className="sm:hidden flex items-center justify-between mt-3">
            <QtyControl
              qty={item.quantity}
              onInc={() => onUpdateQty(item.quantity + 1)}
              onDec={() => onUpdateQty(item.quantity - 1)}
            />
            <div className="flex flex-col items-end gap-0.5">
              <p className="font-semibold">{fmt(lineTotal)}</p>
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-mute hover:text-red-500 underline underline-offset-2"
              >
                সরান
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: qty controls */}
      <div className="hidden sm:flex justify-center">
        <QtyControl
          qty={item.quantity}
          onInc={() => onUpdateQty(item.quantity + 1)}
          onDec={() => onUpdateQty(item.quantity - 1)}
        />
      </div>

      {/* Desktop: total + remove */}
      <div className="hidden sm:flex flex-col items-end gap-1">
        <p className="font-semibold">{fmt(lineTotal)}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-mute hover:text-red-500 underline underline-offset-2"
        >
          সরান
        </button>
      </div>
    </div>
  );
}
