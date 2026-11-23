"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function resolveTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "light"; // default: black bg / white text
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = resolveTheme();
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.dataset.theme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    // "light" = no override needed (falls back to :root dark bg)
    // "dark"  = white bg via [data-theme="dark"]
    if (next === "dark") {
      document.documentElement.dataset.theme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try { localStorage.setItem("theme", next); } catch {}
  }

  // theme === "light"  → black bg / white text (default)
  // theme === "dark"   → white bg / black text
  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "ডার্ক মোড চালু করুন" : "লাইট মোড চালু করুন"}
      title={isLight ? "ডার্ক মোড" : "লাইট মোড"}
      className="w-10 h-10 rounded-full border border-line grid place-items-center hover:bg-soft transition-colors"
    >
      {isLight ? (
        /* Sun — currently on black bg, click to switch to white bg (dark) */
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx={12} cy={12} r={4} />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* Moon — currently on white bg, click to switch back to black bg (light) */
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
