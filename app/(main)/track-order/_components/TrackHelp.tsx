export default function TrackHelp() {
  return (
    <section className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
      <div className="card p-4 sm:p-5 flex gap-3 min-w-0">
        <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" />
          </svg>
        </span>
        <span>
          <b className="block">অর্ডার নম্বর কোথায়?</b>
          <span className="text-mute">অর্ডারের পর SMS ও কনফার্মেশন পেজে পাবেন।</span>
        </span>
      </div>

      <div className="card p-4 sm:p-5 flex gap-3 min-w-0">
        <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
            <circle cx="7" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" />
          </svg>
        </span>
        <span>
          <b className="block">ডেলিভারি সময়</b>
          <span className="text-mute">ঢাকায় ১–২ দিন, ঢাকার বাইরে ২–৪ দিন।</span>
        </span>
      </div>

      <a href="/" className="card p-4 sm:p-5 flex gap-3 min-w-0 sm:col-span-2 lg:col-span-1 hover:border-ink transition-colors">
        <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
          </svg>
        </span>
        <span>
          <b className="block">সাহায্য দরকার?</b>
          <span className="text-mute">আমাদের সাথে যোগাযোগ করুন →</span>
        </span>
      </a>
    </section>
  );
}
