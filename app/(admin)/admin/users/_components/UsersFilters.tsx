"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useTransition, useRef, useCallback } from "react";
import { ROLES, ROLE_LABEL } from "@/db/permissions";
import { STATUS_LABEL, USER_TYPE_TABS, type UserStatus, type UserTypeTab } from "./types";

interface Props {
  total: number;
  filtered: number;
  staffCount: number;
  customerCount: number;
}

const TYPE_LABEL: Record<UserTypeTab, string> = {
  all: "All users",
  staff: "Staff",
  customers: "Customers",
};

const STATUS_OPTIONS: UserStatus[] = ["active", "inactive", "pending"];

const REGISTERED_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
];

export default function UsersFilters({ total, filtered, staffCount, customerCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentRole = searchParams.get("role") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentReg = searchParams.get("reg") ?? "";
  const currentType = (searchParams.get("type") ?? "all") as UserTypeTab;

  const [searchVal, setSearchVal] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (val: string) => {
    setSearchVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push({ q: val }), 180);
  };

  const handleClear = () => {
    setSearchVal("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = !!(currentQ || currentRole || currentStatus || currentReg || currentType !== "all");

  const tabCount = (tab: UserTypeTab) =>
    tab === "all" ? total : tab === "staff" ? staffCount : customerCount;

  return (
    <section className="card p-4 sm:p-5 mb-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-end">
        {/* Search */}
        <label className="block">
          <span className="flbl">Search</span>
          <span className="relative block">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mute)] pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx={11} cy={11} r={7} />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              className="inp !h-11 !pl-11 text-sm"
              placeholder="Name, email or phone"
              autoComplete="off"
              aria-label="Search users"
              value={searchVal}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchVal && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--soft)] grid place-items-center text-xs"
                aria-label="Clear search"
                onClick={() => {
                  setSearchVal("");
                  push({ q: "" });
                }}
              >
                ✕
              </button>
            )}
          </span>
        </label>

        {/* Role */}
        <label className="block">
          <span className="flbl">Role</span>
          <span className="sel-wrap block">
            <select
              className="inp !h-11 text-sm"
              value={currentRole}
              onChange={(e) => push({ role: e.target.value })}
            >
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </span>
        </label>

        {/* Account status */}
        <label className="block">
          <span className="flbl">Account status</span>
          <span className="sel-wrap block">
            <select
              className="inp !h-11 text-sm"
              value={currentStatus}
              onChange={(e) => push({ status: e.target.value })}
            >
              <option value="">Any status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </span>
        </label>

        {/* Registered */}
        <label className="block">
          <span className="flbl">Registered</span>
          <span className="sel-wrap block">
            <select
              className="inp !h-11 text-sm"
              value={currentReg}
              onChange={(e) => push({ reg: e.target.value })}
            >
              <option value="">Any time</option>
              {REGISTERED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        {/* Clear */}
        <button
          type="button"
          className="btn-ghost !h-11 justify-center"
          disabled={!hasFilters || isPending}
          onClick={handleClear}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 5h18l-7 8v6l-4 2v-8z" />
            <path d="m16 3 5 5M21 3l-5 5" />
          </svg>
          Clear Filters
        </button>
      </div>

      {/* Type tabs + count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--line)]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="User type">
          {USER_TYPE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className="chip"
              aria-pressed={currentType === tab ? "true" : "false"}
              onClick={() => push({ type: tab === "all" ? "" : tab })}
            >
              {TYPE_LABEL[tab]}
              <span className="ml-1.5 text-[var(--mute)]">{tabCount(tab)}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-[var(--mute)]">
          <b className="text-[var(--ink)]">{filtered}</b> of{" "}
          <b className="text-[var(--ink)]">{total}</b> users
        </p>
      </div>
    </section>
  );
}
