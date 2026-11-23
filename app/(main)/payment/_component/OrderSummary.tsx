export default function OrderSummary() {
  return (
    <aside className="lg:sticky lg:top-24 card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-bold text-xl">অর্ডার সামারি</h2>
        <span
          id="orderId"
          className="text-xs font-semibold tracking-wide text-mute"
        />
      </div>
      <div id="items" className="summary-scroll space-y-3.5 pr-1" />
      <div className="mt-5 rounded-2xl bg-soft p-4 text-sm">
        <p className="text-xs font-semibold tracking-wider uppercase text-mute mb-1.5">
          ডেলিভারি
        </p>
        <p id="shipTo" className="leading-relaxed" />
      </div>
      <dl className="mt-4 pt-4 border-t border-line space-y-2.5 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-mute">সাবটোটাল</dt>
          <dd id="sSub" className="font-medium" />
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-mute">কুপন ছাড়</dt>
          <dd id="sDisc" className="font-medium" />
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-mute">ডেলিভারি</dt>
          <dd id="sShip" className="font-medium" />
        </div>
        <div className="flex items-end justify-between gap-4 pt-3 border-t border-line">
          <dt className="font-bold">পরিশোধযোগ্য</dt>
          <dd
            id="sTotal"
            className="font-display font-extrabold text-[1.7rem] leading-none"
          />
        </div>
      </dl>
      <div className="pay-bar lg:static lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 lg:backdrop-filter-none mt-5">
        <div className="flex items-center gap-3 lg:block">
          <div className="lg:hidden min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-mute">
              পরিশোধযোগ্য
            </p>
            <p
              id="liveTotal"
              className="font-display font-extrabold text-xl leading-none"
            />
          </div>
          <button
            id="submitBtn"
            type="submit"
            className="flex-1 lg:w-full h-[52px] rounded-2xl bg-ink text-bg font-semibold text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            পেমেন্ট সাবমিট করুন
          </button>
        </div>
        <p className="hidden lg:block text-xs text-mute text-center mt-3">
          পেমেন্ট যাচাই হলে SMS-এ কনফার্মেশন পাবেন
        </p>
      </div>
    </aside>
  );
}
