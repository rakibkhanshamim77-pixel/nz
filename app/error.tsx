"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="bn">
      <body className="antialiased bg-[#fafaf8] text-[#0f0f0d] min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
        <span className="text-6xl mb-4" aria-hidden="true">⚠</span>
        <h1 className="text-2xl font-bold mb-3">কিছু একটা ভুল হয়েছে</h1>
        <p className="text-sm opacity-60 max-w-xs mb-8 leading-relaxed">
          অপ্রত্যাশিত একটি সমস্যা হয়েছে। পেজটি রিফ্রেশ করলে ঠিক হতে পারে।
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="h-11 px-6 rounded-xl bg-[#0f0f0d] text-[#fafaf8] font-semibold text-sm hover:opacity-90"
          >
            আবার চেষ্টা করুন
          </button>
          <Link
            href="/"
            className="h-11 px-6 rounded-xl border border-[#e0dfd8] font-semibold text-sm hover:bg-[#f2f1ec]"
          >
            হোমে ফিরুন
          </Link>
        </div>
      </body>
    </html>
  );
}
