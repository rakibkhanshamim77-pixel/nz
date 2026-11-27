"use client";

import { Suspense } from "react";
import { useShopUrl } from "./useShopUrl";
import { Search } from "lucide-react";

function Inner() {
  const { reset } = useShopUrl();
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-3xl bg-soft border border-line py-20 px-6">
      <span className="text-5xl mb-4" aria-hidden="true">
        <Search/>
      </span>
      <b className="font-display text-xl text-ink block mb-2">কোনো পণ্য মেলেনি</b>
      <p className="text-mute text-sm max-w-xs mb-6">
        ফিল্টার কমিয়ে বা অন্য সাইজ / কালার বেছে আবার দেখুন।
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-11 px-6 rounded-xl bg-ink text-bg text-sm font-semibold hover:opacity-85 transition"
      >
        ফিল্টার মুছুন
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
          <b className="font-display text-xl block mb-2">কোনো পণ্য মেলেনি</b>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
