"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  backHref?: string;
  userName?: string;
  userRole?: string;
  actions?: React.ReactNode;
  notificationCount?: number;
  searchPlaceholder?: string;
}

export default function AdminTopbar({
  backHref,
  userName,
  userRole,
  actions,
  notificationCount = 0,
  searchPlaceholder = "Search…",
}: Props) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin-theme") as
      | "light"
      | "dark"
      | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("admin-theme", next);
  }

  function toggleMenu() {
    document.body.classList.toggle("menu-open");
  }

  const initials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--line)]">
      <div className="h-[72px] px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={toggleMenu}
          className="lg:hidden shrink-0 w-10 h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] grid place-items-center hover:bg-[var(--soft)] transition-colors"
          aria-label="Open sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        {/* Back button (optional) */}
        {backHref && (
          <Link
            href={backHref}
            className="shrink-0 w-10 h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] grid place-items-center hover:bg-[var(--soft)] transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M15 6 9 12l6 6" />
            </svg>
          </Link>
        )}

        {/* Global search */}
        <label className="relative flex-1 max-w-md hidden sm:block">
          <svg
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mute)] pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            className="inp !h-11 !pl-11 text-sm"
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </label>

        {/* Page-specific actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] grid place-items-center hover:bg-[var(--soft)] transition-colors"
          >
            {theme === "dark" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
          </button>

          {/* Notifications bell */}
          <Link
            href="/admin#payments"
            className="relative w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] grid place-items-center hover:bg-[var(--soft)] transition-colors"
            aria-label="Notifications"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold grid place-items-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </Link>

          {/* User avatar */}
          <span className="hidden sm:flex items-center gap-2.5 pl-2">
            <span className="w-10 h-10 rounded-full bg-[var(--ink)] text-[var(--bg)] grid place-items-center font-display font-bold text-sm">
              {initials}
            </span>
            <span className="leading-tight hidden md:block">
              <b className="block text-sm">{userName ?? "Admin"}</b>
              <span className="text-xs text-[var(--mute)] capitalize">
                {userRole ?? "admin"}
              </span>
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
