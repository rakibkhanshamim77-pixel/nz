import Link from "next/link";

const FREE_SHIP_THRESHOLD = 1500;

function fmt(n: number) {
  return "BDT " + n.toLocaleString("en-US");
}

interface Props {
  subtotal: number;
  itemCount: number;
}

export default function CartSummary({ subtotal, itemCount }: Props) {
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const shipPct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  const freeShipping = subtotal >= FREE_SHIP_THRESHOLD;

  return (
    <aside className="lg:sticky lg:top-24 card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl">অর্ডার সামারি</h2>
        <span className="text-xs font-semibold tracking-wide uppercase text-mute">
          {itemCount.toLocaleString("bn-BD")}টি পণ্য
        </span>
      </div>

      {/* Free shipping progress */}
      <div className="mb-5 rounded-2xl bg-soft p-3.5">
        <p className="text-sm text-mute mb-2">
          {freeShipping
            ? "🎉 আপনি ফ্রি ডেলিভারি পাচ্ছেন!"
            : `আরও ${fmt(remaining)} যোগ করুন — ফ্রি ডেলিভারি পাবেন`}
        </p>
        <div className="bar-track" aria-hidden="true">
          <div className="bar-fill" style={{ width: `${shipPct}%` }} />
        </div>
      </div>

      {/* Price breakdown */}
      <dl className="space-y-2.5 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-mute">সাবটোটাল</dt>
          <dd className="font-medium">{fmt(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-mute">ডেলিভারি</dt>
          <dd className="font-medium text-sm text-mute text-right">
            চেকআউটে নির্ধারিত
          </dd>
        </div>
        <div className="flex items-end justify-between gap-4 pt-3 border-t border-line">
          <dt className="font-bold">আনুমানিক মোট</dt>
          <dd className="font-display font-extrabold text-[1.7rem] leading-none">
            {fmt(subtotal)}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-mute mt-3">
        কুপন কোড ও ডেলিভারি এলাকা চেকআউট পেজে নির্বাচন করবেন।
      </p>

      {/* Checkout button */}
      <div className="checkout-bar lg:static lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 lg:backdrop-filter-none mt-5">
        <div className="flex items-center gap-3 lg:block">
          <div className="lg:hidden min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-mute">
              সাবটোটাল
            </p>
            <p className="font-display font-extrabold text-xl leading-none">
              {fmt(subtotal)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex-1 lg:w-full h-[52px] rounded-2xl bg-ink text-bg font-semibold text-base hover:opacity-90 flex items-center justify-center gap-2"
          >
            চেকআউটে যান
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
          ৭ দিনের মধ্যে ফ্রি সাইজ এক্সচেঞ্জ
        </p>
      </div>
    </aside>
  );
}
