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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-10 pb-36 lg:pb-20">
        <div className="animate-pulse space-y-3">
          <div className="h-10 w-48 bg-soft rounded-2xl" />
          <div className="h-72 bg-soft rounded-3xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-0 sm:px-6 pt-0 sm:pt-10 pb-36 lg:pb-20">

      {/* Mobile header bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-0 sm:mb-6 sm:pb-0">
        <div className="flex items-center gap-3">
          <Link href="/shop" className="lg:hidden w-9 h-9 rounded-full bg-soft flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M15 6 9 12l6 6" />
            </svg>
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              আপনার কার্ট
            </h1>
            {itemCount > 0 && (
              <p className="text-xs text-mute">{itemCount}টি পণ্য</p>
            )}
          </div>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={clearCart} className="text-xs text-mute hover:text-wine transition-colors">
            সব মুছুন
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="px-4 sm:px-0">
          <CartEmptyState />
        </div>
      ) : (
        <>
          {/* Mobile layout: stacked full-width cards */}
          <div className="lg:hidden">
            {/* Items */}
            <div className="divide-y divide-line border-t border-b border-line bg-surface">
              {items.map((item) => (
                <CartItemRow
                  key={cartItemKey(item)}
                  item={item}
                  onUpdateQty={(qty) => updateQty(item, qty)}
                  onRemove={() => removeItem(item)}
                />
              ))}
            </div>

            {/* Free shipping notice */}
            <MobileFreeShipBanner subtotal={subtotal} />

            {/* Price breakdown */}
            <div className="mt-3 mx-4 card p-4 space-y-2.5 text-[15px]">
              <div className="flex justify-between gap-4">
                <span className="text-mute">সাবটোটাল</span>
                <span className="font-medium">BDT {subtotal.toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-mute">ডেলিভারি চার্জ</span>
                <span className="text-sm text-mute">চেকআউটে নির্ধারিত</span>
              </div>
              <div className="flex justify-between items-center gap-4 pt-2.5 border-t border-line">
                <span className="font-bold">আনুমানিক মোট</span>
                <span className="font-display font-extrabold text-2xl">BDT {subtotal.toLocaleString("en-US")}</span>
              </div>
            </div>

            <p className="text-xs text-mute text-center mt-3 mx-4 mb-4">
              কুপন কোড ও ডেলিভারি এলাকা চেকআউট পেজে নির্বাচন করবেন।
            </p>
          </div>

          {/* Mobile sticky checkout bar */}
          <div className="checkout-bar lg:hidden">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-mute">মোট</p>
                <p className="font-display font-extrabold text-xl leading-none">BDT {subtotal.toLocaleString("en-US")}</p>
              </div>
              <Link
                href="/checkout"
                className="flex-1 h-12 rounded-2xl bg-ink text-bg font-semibold text-base hover:opacity-90 flex items-center justify-center gap-2"
              >
                চেকআউট করুন
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Desktop layout: 2-column grid */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
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
            <CartSummary subtotal={subtotal} itemCount={itemCount} />
          </div>
        </>
      )}
    </main>
  );
}

function MobileFreeShipBanner({ subtotal }: { subtotal: number }) {
  const FREE_SHIP_THRESHOLD = 1500;
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const shipPct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  const freeShipping = subtotal >= FREE_SHIP_THRESHOLD;

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-soft p-3.5">
      <p className="text-sm text-ink mb-2 font-medium">
        {freeShipping
          ? "🎉 আপনি ফ্রি ডেলিভারি পাচ্ছেন!"
          : `আরও BDT ${remaining.toLocaleString("en-US")} যোগ করুন — ফ্রি ডেলিভারি পাবেন`}
      </p>
      <div className="h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full bg-ink transition-all duration-500"
          style={{ width: `${shipPct}%` }}
        />
      </div>
    </div>
  );
}
