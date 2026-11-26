"use client";

import { Suspense } from "react";
import { useShopUrl } from "./useShopUrl";

function Inner() {
  const { reset } = useShopUrl();
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-3xl bg-soft border border-line py-20 px-6">
      <span className="text-5xl mb-4" aria-hidden="true">🔍</span>
      <b className="font-display text-xl text-ink block mb-2">No products found</b>
      <p className="text-mute text-sm max-w-xs mb-6">
        Try reducing filters or choosing a different size / color.
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-11 px-6 rounded-xl bg-ink text-bg text-sm font-semibold hover:opacity-85 transition"
      >
        Clear Filters
      </button>
    </div>
  );
}

export default function ShopEmptyState() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center text-center rounded-3xl bg-soft border border-line py-20 px-6">
          <span className="text-5xl mb-4">🔍</span>
          <b className="font-display text-xl block mb-2">No products found</b>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
