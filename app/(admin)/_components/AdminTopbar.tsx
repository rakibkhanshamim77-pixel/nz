"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/db/actions/auth.action";
import NotificationBell from "./NotificationBell";
import AdminSearch from "./AdminSearch";

interface Props {
  title?: string;
  subtitle?: string;
  backHref?: string;
  userName?: string;
  userRole?: string;
  actions?: React.ReactNode;
  /** @deprecated */
  notificationCount?: number;
  searchPlaceholder?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function AdminTopbar({
  backHref,
  userName,
  userRole,
  actions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notificationCount: _nc,
}: Props) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Hydrate theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("admin-theme", next);
  }

  function handleLogout() {
    setMenuOpen(false);
    startTransition(async () => {
      await logout();
      router.replace("/login");
      router.refresh();
    });
  }

  const initials = userName
    ? userName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "AD";
  const displayName = userName ?? "Admin";
  const displayRole = userRole ?? "admin";

  return (
    <header className="sticky top-0 z-30 border-b" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
      <div className="h-16 px-4 sm:px-6 flex items-center gap-3">

        {/* Mobile hamburger */}
        <button type="button" onClick={() => document.body.classList.toggle("menu-open")}
          className="lg:hidden shrink-0 w-9 h-9 rounded-xl border grid place-items-center transition-colors hover:bg-[var(--soft)]"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }} aria-label="Open sidebar">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        {/* Back button */}
        {backHref && (
          <Link href={backHref}
            className="shrink-0 w-9 h-9 rounded-xl border grid place-items-center transition-colors hover:bg-[var(--soft)]"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }} aria-label="Go back">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 6 9 12l6 6" />
            </svg>
          </Link>
        )}

        {/* Search */}
        <AdminSearch />

        {/* Page actions */}
        {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">

          {/* Theme toggle */}
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl border grid place-items-center transition-colors hover:bg-[var(--soft)]"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            {theme === "dark" ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="w-px h-6 mx-1 hidden sm:block" style={{ background: "var(--line)" }} />

          {/* User menu */}
          <div ref={menuRef} className="relative hidden sm:block">
            <button type="button" onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen} aria-haspopup="true"
              className="flex items-center gap-2 pl-1.5 pr-2.5 h-9 rounded-xl border transition-colors hover:bg-[var(--soft)]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
              {/* Avatar */}
              <span className="w-6 h-6 rounded-full grid place-items-center font-bold text-[11px] shrink-0"
                style={{ background: "var(--ink)", color: "var(--bg)" }}>
                {initials}
              </span>
              {/* Name — hidden on small screens */}
              <span className="hidden md:block leading-tight text-left">
                <b className="block text-xs font-semibold truncate max-w-[100px]">{displayName}</b>
              </span>
              <svg className={`w-3 h-3 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--mute)" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl z-50"
                style={{ background: "var(--bg)", border: "1px solid var(--line)" }} role="menu">

                {/* User card */}
                <div className="flex items-center gap-3 px-4 py-4"
                  style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
                  <span className="w-10 h-10 rounded-full grid place-items-center font-display font-bold text-sm shrink-0"
                    style={{ background: "var(--ink)", color: "var(--bg)" }}>
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: "var(--ink)", color: "var(--bg)" }}>
                      {displayRole}
                    </span>
                  </div>
                </div>

                <div className="p-1.5">
                  <Link href="/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} role="menuitem"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--soft)]">
                    <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                      <svg className="w-3.5 h-3.5" style={{ color: "var(--mute)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </span>
                    <span>Main Website</span>
                    <svg className="w-3 h-3 ml-auto" style={{ color: "var(--mute)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                    </svg>
                  </Link>

                  <Link href="/admin/profile" onClick={() => setMenuOpen(false)} role="menuitem"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--soft)]">
                    <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                      <svg className="w-3.5 h-3.5" style={{ color: "var(--mute)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </span>
                    Profile Settings
                  </Link>

                  <div className="h-px mx-2 my-1" style={{ background: "var(--line)" }} />

                  <button onClick={handleLogout} disabled={isPending} role="menuitem"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-left disabled:opacity-50">
                    <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0 bg-red-50 dark:bg-red-900/20">
                      <svg className="w-3.5 h-3.5" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                    </span>
                    <span style={{ color: "#ef4444" }}>{isPending ? "Signing out…" : "Logout"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
