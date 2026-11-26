"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

const TABS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];

interface Props {
  currentTab: string;
  currentQ: string;
  total: number;
}

export default function CouponsFilters({ currentTab, currentQ, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const push = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (!updates.page) params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="mb-5 space-y-3">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => push({ tab: tab.value })}
            className={`chip ${currentTab === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + count */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mute)] pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            defaultValue={currentQ}
            placeholder="Search coupon code…"
            className="inp !pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter")
                push({ q: (e.target as HTMLInputElement).value });
            }}
            onChange={(e) => {
              if (!e.target.value) push({ q: "" });
            }}
          />
        </div>
        {(currentTab || currentQ) && (
          <button
            type="button"
            className="btn-ghost !h-9 !px-3 !rounded-xl text-sm"
            onClick={() => push({ tab: "", q: "" })}
          >
            Clear filters
          </button>
        )}
        <span className="text-sm text-[var(--mute)] ml-auto">
          {total} result{total !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
