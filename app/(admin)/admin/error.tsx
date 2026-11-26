"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl grid place-items-center"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <svg className="w-8 h-8" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>

      <div className="max-w-sm">
        <h1 className="font-display font-bold text-xl mb-2">Something went wrong</h1>
        <p className="text-sm mb-1" style={{ color: "var(--mute)" }}>
          There was a problem loading this page. Try again or refresh.
        </p>
        {error.digest && (
          <p className="text-xs font-mono mt-2" style={{ color: "var(--mute)" }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="h-10 px-5 rounded-xl text-sm font-semibold border transition-colors hover:bg-[var(--soft)]"
          style={{ borderColor: "var(--line)" }}>
          Try again
        </button>
        <a
          href="/admin"
          className="h-10 px-5 rounded-xl text-sm font-semibold grid place-items-center transition-opacity hover:opacity-80"
          style={{ background: "var(--ink)", color: "var(--bg)" }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
