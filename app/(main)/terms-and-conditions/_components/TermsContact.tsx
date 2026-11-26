import Link from "next/link";

export default function TermsContact() {
  return (
    <div className="bg-soft rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-soft border border-line flex items-center justify-center shrink-0 text-ink">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
        </svg>
      </div>

      <div className="flex-1">
        <p className="font-semibold text-sm text-ink mb-0.5">শর্তাবলি নিয়ে প্রশ্ন?</p>
        <p className="text-sm text-mute leading-relaxed">
          কোনো ধারা বুঝতে অসুবিধা হলে বা আরো জানতে চাইলে আমাদের সাথে যোগাযোগ করুন।
        </p>
      </div>

      <Link
        href="/"
        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-bg text-sm font-medium hover:opacity-80 transition-opacity"
      >
        যোগাযোগ করুন
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
