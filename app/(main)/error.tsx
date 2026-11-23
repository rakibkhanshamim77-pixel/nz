"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MainError]", error);
  }, [error]);

  return (
    <main className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <span
        className="w-16 h-16 rounded-3xl bg-soft grid place-items-center mb-6"
        aria-hidden="true"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1={12} y1={9} x2={12} y2={13} />
          <line x1={12} y1={17} x2="12.01" y2={17} />
        </svg>
      </span>
      <h1 className="font-display font-bold text-2xl sm:text-3xl mb-3 tracking-tight">
        কিছু একটা ভুল হয়েছে
      </h1>
      <p className="text-mute text-[15px] max-w-xs sm:max-w-sm leading-relaxed mb-8">
        অপ্রত্যাশিত একটি সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা হোমে ফিরুন।
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="h-12 px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 inline-flex items-center gap-2 transition-opacity"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="h-12 px-7 rounded-2xl border border-line font-semibold hover:bg-soft inline-flex items-center transition-colors"
        >
          হোমে ফিরুন
        </Link>
      </div>
    </main>
  );
}
