export default function PaymentForm() {
  return (
    <section className="card p-5 sm:p-7">
      <div className="flex items-start gap-3 mb-6">
        <span className="step-no">3</span>
        <div>
          <h2 className="font-display font-bold text-xl leading-tight">
            পেমেন্ট তথ্য দিন
          </h2>
          <p className="text-sm text-mute mt-0.5">
            টাকা পাঠানোর পর SMS-এ পাওয়া তথ্য লিখুন
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="lbl">যে নম্বর থেকে পাঠিয়েছেন *</span>
          <input
            id="sender"
            className="inp"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            autoComplete="tel-national"
            maxLength={14}
          />
        </label>
        <label className="block">
          <span className="lbl">ট্রানজেকশন আইডি (TrxID) *</span>
          <input
            id="trx"
            className="inp mono"
            placeholder="যেমন: 9GH7K2L3MN"
            autoComplete="off"
            maxLength={20}
            spellCheck={false}
          />
        </label>
        <div className="sm:col-span-2">
          <span className="lbl">
            পেমেন্টের স্ক্রিনশট{" "}
            <span className="font-medium text-mute">(ঐচ্ছিক)</span>
          </span>
          <label
            id="drop"
            className="drop flex items-center gap-4 p-4 cursor-pointer"
          >
            <input id="shot" type="file" accept="image/*" className="sr-only" />
            <span
              id="shotPreview"
              className="w-14 h-14 rounded-xl bg-surface border border-line grid place-items-center shrink-0 overflow-hidden"
            >
              <svg
                className="w-6 h-6 text-mute"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <rect x={3} y={5} width={18} height={14} rx={2} />
                <circle cx={9} cy={10} r="1.6" />
                <path d="m21 16-5-5-8 8" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <b id="shotName" className="block text-sm truncate">
                ছবি আপলোড করুন
              </b>
              <span id="shotHint" className="text-xs text-mute">
                PNG বা JPG, সর্বোচ্চ ৫ MB
              </span>
            </span>
            <button
              id="shotClear"
              type="button"
              className="hidden text-xs text-mute hover:text-ink underline"
            >
              সরান
            </button>
          </label>
        </div>
      </div>
      <p
        id="formErr"
        className="hidden mt-4 text-sm font-medium"
        role="alert"
      />
    </section>
  );
}
