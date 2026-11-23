"use client";

import { useEffect, useState } from "react";

type State = "online" | "offline" | "restored";

export default function NetworkStatus() {
  const [state, setState] = useState<State>("online");

  useEffect(() => {
    // Don't flash on initial mount — only react to changes
    let restoreTimer: ReturnType<typeof setTimeout>;

    function handleOffline() {
      clearTimeout(restoreTimer);
      setState("offline");
    }

    function handleOnline() {
      setState("restored");
      restoreTimer = setTimeout(() => setState("online"), 3500);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Sync with actual state in case connection dropped before mount
    if (!navigator.onLine) setState("offline");

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimeout(restoreTimer);
    };
  }, []);

  if (state === "online") return null;

  const isOffline = state === "offline";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
    >
      <div
        className={`
          flex items-center gap-2.5 px-5 py-3 rounded-full shadow-lg text-sm font-semibold
          transition-all duration-300
          ${isOffline
            ? "bg-ink text-bg"
            : "bg-[#1a7a4a] text-white"
          }
        `}
      >
        {isOffline ? (
          <>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <line x1={1} y1={1} x2={23} y2={23} />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
            </svg>
            ইন্টারনেট সংযোগ নেই
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            ইন্টারনেট সংযোগ পুনরায় স্থাপিত হয়েছে
          </>
        )}
      </div>
    </div>
  );
}
