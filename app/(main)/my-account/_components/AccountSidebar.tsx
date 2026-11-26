"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/db/actions/auth.action";
import Link from "next/link";

interface Props {
  orderCount: number;
  addressCount: number;
}

const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect x={3} y={3} width={7} height={9} rx="1.5" />
        <rect x={14} y={3} width={7} height={5} rx="1.5" />
        <rect x={14} y={12} width={7} height={9} rx="1.5" />
        <rect x={3} y={16} width={7} height={5} rx="1.5" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "My Orders",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx={12} cy={8} r={4} />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    id: "addresses",
    label: "Addresses",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
        <circle cx={12} cy="9.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx={12} cy={12} r={3} />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </svg>
    ),
  },
] as const;

export default function AccountSidebar({ orderCount, addressCount }: Props) {
  const router = useRouter();
  const [active, setActive] = useState("dashboard");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const sync = () => setActive(window.location.hash.slice(1) || "dashboard");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.replace("/login");
    });
  }

  const badges: Record<string, number> = {
    orders: orderCount,
    addresses: addressCount,
  };

  const allItems = [
    ...NAV.map((item) => ({ ...item, isLogout: false as const })),
    {
      id: "logout",
      label: "Logout",
      isLogout: true as const,
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h11" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="lg:sticky lg:top-24">
      {/* ── Desktop: vertical card sidebar ── */}
      <nav className="hidden lg:flex flex-col card p-2 gap-1" aria-label="Account menu">
        {NAV.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            aria-selected={active === item.id ? "true" : undefined}
            onClick={() => setActive(item.id)}
            className="tab"
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {badges[item.id] ? (
              <span className="cnt">{badges[item.id]}</span>
            ) : null}
          </Link>
        ))}
        <div className="h-px bg-[var(--line)] my-1" />
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="tab disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h11" />
          </svg>
          {isPending ? "Logging out…" : "Logout"}
        </button>
      </nav>

      {/* ── Mobile: horizontal scrollable icon+label tab bar ── */}
      <nav
        className="lg:hidden card px-2 py-1 flex gap-0.5 overflow-x-auto no-scrollbar"
        aria-label="Account menu"
      >
        {allItems.map((item) => {
          const isActive = !item.isLogout && active === item.id;
          return item.isLogout ? (
            <button
              key="logout"
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex flex-col items-center justify-center gap-1 flex-1 min-w-[52px] py-2 px-1 rounded-xl text-mute disabled:opacity-50 transition-colors"
            >
              {item.icon}
              <span className="text-[9px] font-semibold leading-tight whitespace-nowrap">
                {isPending ? "…" : item.label}
              </span>
            </button>
          ) : (
            <Link
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActive(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-w-[52px] py-2 px-1 rounded-xl transition-colors ${
                isActive ? "bg-ink text-bg" : "text-mute"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-semibold leading-tight whitespace-nowrap">
                {item.label === "Dashboard" ? "Home" :
                 item.label === "My Orders" ? "Orders" :
                 item.label}
              </span>
              {badges[item.id] ? (
                <span className={`absolute top-1 right-1 grid place-items-center min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold ${
                  isActive ? "bg-bg/25 text-bg" : "bg-soft text-ink"
                }`}>
                  {badges[item.id]}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
