"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { SHOP_MAX_PRICE } from "./shop.constants";

export function useShopUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  // ── Readers ──────────────────────────────────────────────

  const q = searchParams.get("q") ?? "";

  const sort = searchParams.get("sort") ?? "pop";

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const cats = splitParam(searchParams.get("cat"));
  const sizes = splitParam(searchParams.get("size"));
  const colors = splitParam(searchParams.get("color"));

  const maxPriceParam = searchParams.get("maxPrice");

  const parsedMaxPrice = maxPriceParam
    ? parseInt(maxPriceParam, 10)
    : SHOP_MAX_PRICE;

  const maxPrice =
    Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0
      ? parsedMaxPrice
      : SHOP_MAX_PRICE;

  const inStock = searchParams.get("inStock") === "1";
  const onSale = searchParams.get("onSale") === "1";

  // ── Active Filter Count ──────────────────────────────────

  const activeFilterCount =
    cats.length +
    sizes.length +
    colors.length +
    (maxPrice < SHOP_MAX_PRICE ? 1 : 0) +
    (inStock ? 1 : 0) +
    (onSale ? 1 : 0);

  // ── URL Writer ───────────────────────────────────────────

  const push = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      if (resetPage) {
        params.delete("page");
      }

      const queryString = params.toString();

      const url = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.push(url, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  // ── Multi Select Toggle ──────────────────────────────────

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const current = splitParam(searchParams.get(key));

      let next: string[];

      if (current.includes(value)) {
        next = current.filter((item) => item !== value);
      } else {
        next = [...current, value];
      }

      push({
        [key]: next.length > 0 ? next.join(",") : null,
      });
    },
    [searchParams, push],
  );

  // ── Search ───────────────────────────────────────────────

  const setQ = useCallback(
    (value: string) => {
      push({ q: value.trim() || null });
    },
    [push],
  );

  // ── Sorting ──────────────────────────────────────────────

  const setSort = useCallback(
    (value: string) => {
      push({ sort: value }, false);
    },
    [push],
  );

  // ── Pagination ───────────────────────────────────────────

  const setPage = useCallback(
    (value: number) => {
      const nextPage = Math.max(1, Math.floor(value));

      push({ page: nextPage > 1 ? String(nextPage) : null }, false);
    },
    [push],
  );

  // ── Price Filter ─────────────────────────────────────────

  const setMaxPrice = useCallback(
    (value: number) => {
      const price = Math.max(0, Math.min(value, SHOP_MAX_PRICE));

      push({
        maxPrice: price < SHOP_MAX_PRICE ? String(price) : null,
      });
    },
    [push],
  );

  // ── Stock Filter ─────────────────────────────────────────

  const setInStock = useCallback(
    (value: boolean) => {
      push({
        inStock: value ? "1" : null,
      });
    },
    [push],
  );

  // ── Sale Filter ──────────────────────────────────────────

  const setOnSale = useCallback(
    (value: boolean) => {
      push({
        onSale: value ? "1" : null,
      });
    },
    [push],
  );

  // ── Category, Size, Color ────────────────────────────────

  const toggleCat = useCallback(
    (value: string) => {
      toggleMulti("cat", value);
    },
    [toggleMulti],
  );

  const toggleSize = useCallback(
    (value: string) => {
      toggleMulti("size", value);
    },
    [toggleMulti],
  );

  const toggleColor = useCallback(
    (value: string) => {
      toggleMulti("color", value);
    },
    [toggleMulti],
  );

  // ── Reset Filters ────────────────────────────────────────

  const reset = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  // ── Return ───────────────────────────────────────────────

  return {
    // State
    q,
    sort,
    page,
    cats,
    sizes,
    colors,
    maxPrice,
    inStock,
    onSale,
    activeFilterCount,
    isPending,

    // Actions
    setQ,
    setSort,
    setPage,
    toggleCat,
    toggleSize,
    toggleColor,
    setMaxPrice,
    setInStock,
    setOnSale,
    reset,
  };
}

// ── Helpers ─────────────────────────────────────────────────

function splitParam(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
