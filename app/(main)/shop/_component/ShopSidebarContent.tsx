"use client";

import { useShopUrl } from "./useShopUrl";
import { SHOP_SIZES, SHOP_COLOR_OPTIONS, SHOP_MAX_PRICE, SHOP_MIN_PRICE } from "./shop.constants";
import type { CategoryItem } from "@/db/actions/categories.action";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  categories: CategoryItem[];
  onClose?: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold tracking-widest uppercase text-mute mb-3">{children}</p>;
}

export default function ShopSidebarContent({ categories, onClose }: Props) {
  const {
    cats, sizes, colors, maxPrice, inStock, onSale, activeFilterCount,
    toggleCat, toggleSize, toggleColor,
    setMaxPrice, setInStock, setOnSale, reset,
  } = useShopUrl();
  const { fmt } = useCurrency();

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="font-display font-bold text-lg text-ink">Filters</span>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => { reset(); onClose?.(); }}
              className="text-xs font-semibold text-wine hover:underline transition"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-full border border-line grid place-items-center hover:bg-soft transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <hr className="border-line" />

      {/* categories */}
      <div>
        <SectionTitle>Category</SectionTitle>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const active = cats.includes(cat.filter);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCat(cat.filter)}
                className={[
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition",
                  active
                    ? "bg-ink text-bg font-semibold"
                    : "hover:bg-soft text-ink",
                ].join(" ")}
              >
                <span>{cat.name}</span>
                {active && (
                  <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-line" />

      {/* sizes */}
      <div>
        <SectionTitle>Size</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {SHOP_SIZES.map((s) => {
            const active = sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={[
                  "h-9 min-w-[42px] px-3 rounded-xl border text-sm font-semibold transition",
                  active
                    ? "bg-ink text-bg border-ink"
                    : "border-line text-ink hover:border-ink hover:bg-soft",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-line" />

      {/* colors */}
      <div>
        <SectionTitle>Color</SectionTitle>
        <div className="flex flex-wrap gap-2.5">
          {SHOP_COLOR_OPTIONS.map(({ name, hex }) => {
            const active = colors.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleColor(name)}
                title={name}
                aria-label={name}
                aria-pressed={active}
                className={[
                  "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                  active
                    ? "ring-2 ring-offset-2 ring-wine ring-offset-bg border-transparent scale-110"
                    : "border-line",
                ].join(" ")}
                style={{ background: hex }}
              />
            );
          })}
        </div>
      </div>

      <hr className="border-line" />

      {/* price range */}
      <div>
        <SectionTitle>Max Price</SectionTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-mute">{fmt(SHOP_MIN_PRICE)}</span>
            <span className="font-semibold text-ink">{fmt(maxPrice)}</span>
          </div>
          <input
            type="range"
            min={SHOP_MIN_PRICE}
            max={SHOP_MAX_PRICE}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 rounded-full cursor-pointer accent-wine"
          />
        </div>
      </div>

      <hr className="border-line" />

      {/* toggles */}
      <div className="space-y-3">
        <SectionTitle>Other</SectionTitle>
        {(
          [
            { key: "inStock", label: "In Stock Only", value: inStock, set: setInStock },
            { key: "onSale",  label: "On Sale Only",  value: onSale,  set: setOnSale },
          ] as const
        ).map(({ key, label, value, set }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer select-none">
            <span className="text-sm text-ink">{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={value}
              onClick={() => set(!value)}
              className={[
                "relative w-10 h-5 rounded-full border transition-colors overflow-hidden shrink-0",
                value ? "bg-wine border-wine" : "bg-soft border-line",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  value ? "translate-x-5" : "translate-x-0.5",
                ].join(" ")}
              />
            </button>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => { reset(); onClose?.(); }}
        className="w-full h-11 rounded-xl border border-line bg-surface text-sm font-semibold text-ink hover:bg-soft transition"
      >
        Clear Filters
      </button>
    </div>
  );
}
