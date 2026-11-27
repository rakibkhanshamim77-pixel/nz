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
    label: "ড্যাশবোর্ড",
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
    label: "আমার অর্ডার",
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
    label: "প্রোফাইল",
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
    label: "ঠিকানা",
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
    label: "সেটিংস",
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
    const syncHash = () => setActive(window.location.hash.slice(1) || "dashboard");
    const onNav = (e: Event) => setActive((e as CustomEvent<string>).detail);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    window.addEventListener("account-nav", onNav);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
      window.removeEventListener("account-nav", onNav);
    };
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

  return (
    <aside className="lg:sticky lg:top-24">
      {/* ── Desktop: vertical card sidebar ── */}
      <nav className="hidden lg:flex flex-col card p-2 gap-1" aria-label="অ্যাকাউন্ট মেনু">
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
          {isPending ? "লগআউট হচ্ছে…" : "লগআউট"}
        </button>
      </nav>

      {/* ── Mobile: native-app style vertical list menu — hidden when viewing a sub-section ── */}
      <nav className={`lg:hidden card overflow-hidden ${active !== "dashboard" ? "hidden" : ""}`} aria-label="অ্যাকাউন্ট মেনু">
        {NAV.map((item, i) => {
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              href={`#${item.id}`}
              onClick={() => {
                setActive(item.id);
                window.dispatchEvent(new CustomEvent("account-nav", { detail: item.id }));
              }}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < NAV.length - 1 ? "border-b border-line" : ""} hover:bg-soft transition-colors`}
            >
              <span className={isActive ? "text-ink" : "text-mute"}>{item.icon}</span>
              <span className={`flex-1 text-sm font-medium ${isActive ? "font-semibold text-ink" : "text-ink"}`}>
                {item.label}
              </span>
              {badges[item.id] ? (
                <span className="cnt">{badges[item.id]}</span>
              ) : null}
              <svg className="w-4 h-4 text-mute shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          );
        })}

        {/* Extra links */}
        {[
          { label: "অর্ডার ট্র্যাক", href: "/track-order", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x={2} y={7} width={20} height={14} rx={2} /><path d="M16 7V5a2 2 0 0 0-4 0v2M9 11v6M15 11v6" /></svg> },
          { label: "সাহায্য ও সহায়তা", href: "/contact", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx={12} cy={12} r={10} /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" /></svg> },
          { label: "আমাদের সম্পর্কে", href: "/about", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx={12} cy={12} r={10} /><path d="M12 16v-4M12 8h.01" /></svg> },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-4 py-3.5 border-t border-line hover:bg-soft transition-colors"
          >
            <span className="text-mute">{link.icon}</span>
            <span className="flex-1 text-sm font-medium text-ink">{link.label}</span>
            <svg className="w-4 h-4 text-mute shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ))}

        {/* Logout */}
        <div className="border-t border-line">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-wine hover:bg-soft transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h11" />
            </svg>
            <span className="flex-1 text-sm font-semibold text-left">
              {isPending ? "লগআউট হচ্ছে…" : "লগআউট"}
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
