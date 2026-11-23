"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/db/actions/auth.action";

interface Props {
  orderCount: number;
  addressCount: number;
}

const NAV = [
  {
    id: "dashboard",
    label: "ড্যাশবোর্ড",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
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
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "প্রোফাইল",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx={12} cy={8} r={4} />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    id: "addresses",
    label: "ঠিকানা",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
        <circle cx={12} cy="9.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "সেটিংস",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
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

  const badges: Record<string, number> = { orders: orderCount, addresses: addressCount };

  return (
    <aside className="lg:sticky lg:top-24">
      <nav
        className="card p-2 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar"
        aria-label="অ্যাকাউন্ট মেনু"
      >
        {NAV.map((item) => (
          <a
            key={item.id}
            className="tab"
            href={`#${item.id}`}
            aria-selected={active === item.id ? "true" : undefined}
            onClick={() => setActive(item.id)}
          >
            {item.icon}
            {item.label}
            {badges[item.id] ? <span className="cnt">{badges[item.id]}</span> : null}
          </a>
        ))}

        <div className="hidden lg:block h-px bg-[var(--line)] my-1" />

        <button
          type="button"
          className="tab"
          onClick={handleLogout}
          disabled={isPending}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h11" />
          </svg>
          {isPending ? "লগআউট হচ্ছে…" : "লগআউট"}
        </button>
      </nav>
    </aside>
  );
}
