export default function OrderSummary() {
  return (
    <aside className="lg:sticky lg:top-24 card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl">অর্ডার সামারি</h2>
        <span
          id="itemCount"
          className="text-xs font-semibold tracking-wide uppercase text-mute"
        />
      </div>
      <div id="shipMeter" className="mb-5 rounded-2xl bg-soft p-3.5">
        <div className="flex items-center justify-between gap-3 text-sm mb-2">
          <span id="shipHint" className="text-mute">
            ফ্রি ডেলিভারি আনলক করুন
          </span>
        </div>
        <div className="bar-track" aria-hidden="true">
          <div id="shipBar" className="bar-fill" />
        </div>
      </div>
      <div id="items" className="summary-scroll space-y-4 pr-1" />
      <div id="emptyCart" className="hidden text-center py-10">
        <p className="font-display font-bold text-lg mb-1">
          আপনার কার্ট খালি
        </p>
        <p className="text-sm text-mute mb-5">
          চেকআউট করতে আগে একটি পণ্য যোগ করুন।
        </p>
        <a
          href="shop.html"
          className="inline-flex h-11 items-center px-6 rounded-full bg-ink text-bg font-semibold"
        >
          শপে যান
        </a>
      </div>
      <div id="summaryBody">
        <div className="flex gap-2 mt-5">
          <input
            id="coupon"
            className="inp uppercase tracking-wide"
            placeholder="কুপন কোড"
            style={{ height: 48 }}
            autoComplete="off"
          />
          <button
            type="button"
            id="applyC"
            className="h-12 px-5 rounded-2xl border border-line font-semibold hover:bg-soft shrink-0"
          >
            প্রয়োগ
          </button>
        </div>
        <p id="cMsg" className="text-sm mt-2 min-h-5" role="status" />
        <dl className="mt-2 pt-4 border-t border-line space-y-2.5 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-mute">সাবটোটাল</dt>
            <dd id="sSub" className="font-medium" />
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mute">কুপন ছাড়</dt>
            <dd
              id="sDisc"
              className="font-medium"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mute">ডেলিভারি</dt>
            <dd id="sShip" className="font-medium" />
          </div>
          <div className="flex items-end justify-between gap-4 pt-3 border-t border-line">
            <dt className="font-bold">সর্বমোট</dt>
            <dd
              id="sTotal"
              className="font-display font-extrabold text-[1.7rem] leading-none"
            />
          </div>
        </dl>
        <div className="checkout-bar lg:static lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 lg:backdrop-filter-none mt-5">
          <label className="hidden lg:flex items-start gap-2.5 mb-4 text-sm text-mute cursor-pointer">
            <input
              id="terms"
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-[var(--ink)]"
            />
            <span>
              আমি{" "}
              <a href="#" className="underline text-ink">
                শর্তাবলী
              </a>{" "}
              ও{" "}
              <a href="#" className="underline text-ink">
                রিটার্ন পলিসি
              </a>{" "}
              পড়েছি ও সম্মত।
            </span>
          </label>
          <div className="flex items-center gap-3 lg:block">
            <div className="lg:hidden min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-mute">
                সর্বমোট
              </p>
              <p
                id="liveTotal"
                className="font-display font-extrabold text-xl leading-none"
              />
            </div>
            <button
              id="place"
              type="submit"
              className="flex-1 lg:w-full h-[52px] rounded-2xl bg-ink text-bg font-semibold text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              পেমেন্টে যান
            </button>
          </div>
          <label className="flex lg:hidden items-start gap-2.5 mt-3 text-xs text-mute cursor-pointer">
            <input
              id="termsMobile"
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-[var(--ink)]"
            />
            <span>আমি শর্তাবলী ও রিটার্ন পলিসিতে সম্মত।</span>
          </label>
          <p className="hidden lg:block text-xs text-mute text-center mt-3">
            ৭ দিনের মধ্যে ফ্রি সাইজ এক্সচেঞ্জ
          </p>
        </div>
      </div>
    </aside>
  );
}
