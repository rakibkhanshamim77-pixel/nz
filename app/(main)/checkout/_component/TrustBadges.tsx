export default function TrustBadges() {
  return (
    <section className="card p-5 sm:p-6">
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
              <circle cx={7} cy={18} r="1.6" />
              <circle cx={18} cy={18} r="1.6" />
            </svg>
          </span>
          <span>
            <b className="block">দ্রুত ডেলিভারি</b>
            <span className="text-mute">ঢাকায় ১–২ দিন</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M4 7h16M7 7V5h10v2M6 7l1 13h10l1-13" />
            </svg>
          </span>
          <span>
            <b className="block">ফ্রি এক্সচেঞ্জ</b>
            <span className="text-mute">৭ দিনের মধ্যে</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" />
            </svg>
          </span>
          <span>
            <b className="block">পরবর্তী ধাপ</b>
            <span className="text-mute">পেমেন্ট আলাদা পেজে</span>
          </span>
        </div>
      </div>
    </section>
  );
}
