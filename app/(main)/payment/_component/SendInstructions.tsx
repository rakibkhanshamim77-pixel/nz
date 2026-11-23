export default function SendInstructions() {
  return (
    <section className="card p-5 sm:p-7">
      <div className="flex items-start gap-3 mb-6">
        <span className="step-no">2</span>
        <div>
          <h2 className="font-display font-bold text-xl leading-tight">
            <span id="mName">bKash</span>-এ টাকা পাঠান
          </h2>
          <p className="text-sm text-mute mt-0.5">
            নিচের নম্বরে ঠিক এই পরিমাণ টাকা পাঠান
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-soft p-4">
          <p className="text-xs font-semibold tracking-wider uppercase text-mute mb-1.5">
            <span id="mType">Personal</span> নম্বর
          </p>
          <div className="flex items-center justify-between gap-3">
            <b
              id="payNumber"
              className="font-display font-extrabold text-xl sm:text-2xl tracking-wide"
            />
            <button type="button" className="copy-btn" data-copy="number">
              কপি
            </button>
          </div>
        </div>
        <div className="rounded-2xl bg-soft p-4">
          <p className="text-xs font-semibold tracking-wider uppercase text-mute mb-1.5">
            পাঠানোর পরিমাণ
          </p>
          <div className="flex items-center justify-between gap-3">
            <b
              id="payAmount"
              className="font-display font-extrabold text-xl sm:text-2xl"
            />
            <button type="button" className="copy-btn" data-copy="amount">
              কপি
            </button>
          </div>
        </div>
      </div>
      <ol id="howTo" className="steps space-y-3.5 text-[15px] fade" />
      <div className="mt-6 rounded-2xl border border-line p-4 text-sm text-mute flex gap-3">
        <svg
          className="w-5 h-5 shrink-0 text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx={12} cy={12} r={9} />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <span>
          অবশ্যই <b className="text-ink">Send Money</b> করবেন, Cash Out বা
          Payment নয়। ভুল নম্বরে বা ভুল পরিমাণ পাঠালে অর্ডার কনফার্ম হতে দেরি
          হবে।
        </span>
      </div>
    </section>
  );
}
