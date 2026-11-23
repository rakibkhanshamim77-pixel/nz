"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartProvider";
import { cartItemKey } from "@/lib/cart";
import CartEmptyState from "./CartEmptyState";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";

export default function CartClient() {
  const { items, hydrated, itemCount, subtotal, removeItem, updateQty, clearCart } =
    useCart();

  if (!hydrated) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-36 lg:pb-20">
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-48 bg-soft rounded-2xl" />
          <div className="h-72 bg-soft rounded-3xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-36 lg:pb-20">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink mb-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M15 6 9 12l6 6" />
            </svg>
            শপিং চালিয়ে যান
          </Link>
          <p className="text-xs font-semibold tracking-[.22em] uppercase text-ink mb-1 md:hidden">
            ধাপ ১ / ৩
          </p>
          <h1 className="font-display font-extrabold text-[2rem] sm:text-4xl lg:text-5xl tracking-tight leading-none">
            আপনার কার্ট
          </h1>
          {items.length > 0 && (
            <p className="text-mute mt-2 text-[15px]">
              পণ্যগুলো দেখে নিন, তারপর চেকআউটে যান।
            </p>
          )}
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-mute hover:text-ink underline underline-offset-4"
          >
            সব সরিয়ে দিন
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
          {/* Items list */}
          <section className="card p-5 sm:p-7">
            <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_120px_110px] gap-4 pb-4 mb-1 border-b border-line text-xs font-semibold tracking-wider uppercase text-mute">
              <span>পণ্য</span>
              <span className="text-center">পরিমাণ</span>
              <span className="text-right">মোট</span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {items.map((item) => (
                <CartItemRow
                  key={cartItemKey(item)}
                  item={item}
                  onUpdateQty={(qty) => updateQty(item, qty)}
                  onRemove={() => removeItem(item)}
                />
              ))}
            </div>
          </section>

          {/* Order summary */}
          <CartSummary subtotal={subtotal} itemCount={itemCount} />
        </div>
      )}
    </main>
  );
}
