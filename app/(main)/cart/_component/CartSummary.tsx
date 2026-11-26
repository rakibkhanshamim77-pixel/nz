import Link from "next/link";
import { getCurrencySettings } from "@/db/settings.server";
import { formatPrice } from "@/db/settings";

const FREE_SHIP_THRESHOLD = 1500;

interface Props {
  subtotal: number;
  itemCount: number;
}

export default async function CartSummary({ subtotal, itemCount }: Props) {
  const currency = await getCurrencySettings();
  const fmt = (n: number) => formatPrice(n, currency);
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const shipPct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  const freeShipping = subtotal >= FREE_SHIP_THRESHOLD;

  return (
    <aside className="lg:sticky lg:top-24 card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl">Order Summary</h2>
        <span className="text-xs font-semibold tracking-wide uppercase text-mute">
          {itemCount.toLocaleString("en-US")} items
        </span>
      </div>

      {/* Free shipping progress */}
      <div className="mb-5 rounded-2xl bg-soft p-3.5">
        <p className="text-sm text-mute mb-2">
          {freeShipping
            ? "🎉 You get free delivery!"
            : `Add ${fmt(remaining)} more — get free delivery`}
        </p>
        <div className="bar-track" aria-hidden="true">
          <div className="bar-fill" style={{ width: `${shipPct}%` }} />
        </div>
      </div>

      {/* Price breakdown */}
      <dl className="space-y-2.5 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-mute">Subtotal</dt>
          <dd className="font-medium">{fmt(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-mute">Delivery</dt>
          <dd className="font-medium text-sm text-mute text-right">
            Determined at checkout
          </dd>
        </div>
        <div className="flex items-end justify-between gap-4 pt-3 border-t border-line">
          <dt className="font-bold">Estimated Total</dt>
          <dd className="font-display font-extrabold text-[1.7rem] leading-none">
            {fmt(subtotal)}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-mute mt-3">
        Apply coupon codes and select delivery area at checkout.
      </p>

      {/* Checkout button */}
      <div className="checkout-bar lg:static lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 lg:backdrop-filter-none mt-5">
        <div className="flex items-center gap-3 lg:block">
          <div className="lg:hidden min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-mute">
              Subtotal
            </p>
            <p className="font-display font-extrabold text-xl leading-none">
              {fmt(subtotal)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex-1 lg:w-full h-[52px] rounded-2xl bg-ink text-bg font-semibold text-base hover:opacity-90 flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
        <p className="hidden lg:block text-xs text-mute text-center mt-3">
          Free size exchange within 7 days
        </p>
      </div>
    </aside>
  );
}
