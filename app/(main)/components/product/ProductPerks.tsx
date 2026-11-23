export default function ProductPerks() {
  return (
    <div className="grid grid-cols-3 gap-2 mt-6 text-center text-xs sm:text-sm">
      <div className="rounded-2xl bg-soft p-3 sm:p-4">
        <svg className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
          <circle cx={7} cy={18} r="1.6" />
          <circle cx={18} cy={18} r="1.6" />
        </svg>
        <b className="block">দ্রুত ডেলিভারি</b>
        <span className="text-mute">ঢাকায় ১–২ দিন</span>
      </div>
      <div className="rounded-2xl bg-soft p-3 sm:p-4">
        <svg className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
          <path d="M18 3v4h-4M6 21v-4h4" />
        </svg>
        <b className="block">ফ্রি এক্সচেঞ্জ</b>
        <span className="text-mute">৭ দিনের মধ্যে</span>
      </div>
      <div className="rounded-2xl bg-soft p-3 sm:p-4">
        <svg className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <rect x={3} y={6} width={18} height={12} rx={2} />
          <path d="M3 10h18" />
        </svg>
        <b className="block">সহজ পেমেন্ট</b>
        <span className="text-mute">bKash · Nagad · Rocket</span>
      </div>
    </div>
  );
}
