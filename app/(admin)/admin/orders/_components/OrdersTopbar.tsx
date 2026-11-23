"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

interface Props {
  userName?: string;
  userRole?: string;
}

export default function OrdersTopbar({ userName, userRole }: Props) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = searchRef.current?.value.trim();
      if (q) router.push(`/admin/orders?q=${encodeURIComponent(q)}`);
    }
  }

  function toggleMenu() {
    document.body.classList.toggle("menu-open");
  }

  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-xl border-b border-line">
      <div className="h-[72px] px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={toggleMenu}
          className="lg:hidden w-10 h-10 rounded-xl border border-line bg-surface grid place-items-center"
          aria-label="Open menu"
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

        {/* Search */}
        <label className="relative flex-1 max-w-md hidden sm:block">
          <svg
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-mute pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx={11} cy={11} r={7} />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={searchRef}
            onKeyDown={handleSearch}
            className="inp !h-11 !pl-11 text-sm"
            placeholder="অর্ডার নম্বর, নাম বা ফোন খুঁজুন…"
            aria-label="Search"
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          {/* User info */}
          <span className="hidden sm:flex items-center gap-2.5 pl-2">
            <span className="w-10 h-10 rounded-full bg-ink text-bg grid place-items-center font-display font-bold text-sm">
              {userName ? userName.slice(0, 2).toUpperCase() : "AD"}
            </span>
            <span className="leading-tight hidden md:block">
              <b className="block text-sm">{userName ?? "Admin"}</b>
              <span className="text-xs text-mute capitalize">
                {userRole ?? "admin"}
              </span>
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
