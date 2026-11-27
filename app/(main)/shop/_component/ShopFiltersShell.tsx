"use client";

import { Suspense, useState } from "react";
import ShopSidebarContent from "./ShopSidebarContent";
import ShopToolbar from "./ShopToolbar";
import type { CategoryItem } from "@/db/actions/categories.action";

interface Props {
  categories: CategoryItem[];
  totalCount: number;
  children: React.ReactNode;
}

export default function ShopFiltersShell({ categories, totalCount, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[59] lg:hidden backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar — desktop sticky card / mobile drawer */}
      <aside
        className={[
          "fixed lg:static inset-y-0 left-0 z-[60] w-[88%] max-w-sm lg:w-auto",
          "bg-bg lg:bg-transparent",
          "overflow-y-auto transition-transform duration-300 lg:transition-none lg:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* mobile inner padding / desktop sticky card */}
        <div className="p-5 pb-28 lg:pb-0 lg:p-0 lg:sticky lg:top-24">
          <div className="lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-5">
            <Suspense>
              <ShopSidebarContent
                categories={categories}
                onClose={() => setDrawerOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="min-w-0">
        <Suspense>
          <ShopToolbar
            totalCount={totalCount}
            onOpenFilters={() => setDrawerOpen(true)}
          />
        </Suspense>

        {/* Active filter chips */}
        <Suspense>
          <ActiveChips />
        </Suspense>

        {children}
      </div>
    </div>
  );
}

/* ── Active filter chips ───────────────────────────────────────────── */
import { useShopUrl } from "./useShopUrl";
import { SHOP_COLOR_OPTIONS, SHOP_MAX_PRICE } from "./shop.constants";

function ActiveChips() {
  const {
    q, cats, sizes, colors, maxPrice, inStock, onSale,
    activeFilterCount,
    setQ, toggleCat, toggleSize, toggleColor,
    setMaxPrice, setInStock, setOnSale,
  } = useShopUrl();

  if (activeFilterCount === 0 && !q) return null;

  const chips: { label: string; remove: () => void }[] = [
    ...cats.map((v)    => ({ label: v,                 remove: () => toggleCat(v)   })),
    ...sizes.map((v)   => ({ label: `সাইজ ${v}`,        remove: () => toggleSize(v)  })),
    ...colors.map((v)  => ({
      label: v,
      colorHex: SHOP_COLOR_OPTIONS.find((c) => c.name === v)?.hex,
      remove: () => toggleColor(v),
    })),
    ...(maxPrice < SHOP_MAX_PRICE
      ? [{ label: `≤ BDT ${maxPrice.toLocaleString("en-US")}`, remove: () => setMaxPrice(SHOP_MAX_PRICE) }]
      : []),
    ...(inStock  ? [{ label: "স্টকে আছে",  remove: () => setInStock(false)  }] : []),
    ...(onSale   ? [{ label: "ছাড়ের পণ্য",  remove: () => setOnSale(false)   }] : []),
    ...(q        ? [{ label: `"${q}"`,       remove: () => setQ("")           }] : []),
  ] as (typeof chips[0] & { colorHex?: string })[];

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-full bg-soft border border-line text-xs font-semibold text-ink hover:bg-line transition"
        >
          {(chip as { colorHex?: string }).colorHex && (
            <span
              className="w-3 h-3 rounded-full border border-line"
              style={{ background: (chip as { colorHex?: string }).colorHex }}
            />
          )}
          {chip.label}
          <svg className="w-3 h-3 text-mute" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ))}
    </div>
  );
}
