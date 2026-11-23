"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOW_STOCK_THRESHOLD_OPTIONS } from "@/app/utils/inventory";

interface Props {
  categories: string[];
  threshold: number;
  defaultThreshold: number;
  matched: number;
}

const LEVELS = [
  { key: "", label: "All low stock" },
  { key: "out", label: "Out of stock" },
  { key: "critical", label: "Critical" },
  { key: "low", label: "Low" },
] as const;

export default function LowStockFilters({ categories, threshold, defaultThreshold, matched }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(updates).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      next.delete("page");
      const qs = next.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
    },
    [params, pathname, router],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onSearch = (v: string) => {
    setSearch(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push({ q: v.trim() }), 250);
  };

  const level = params.get("level") ?? "";
  const thresholds = Array.from(new Set<number>([...LOW_STOCK_THRESHOLD_OPTIONS, defaultThreshold, threshold])).sort((a, b) => a - b);
  const hasFilters = !!(params.get("q") || params.get("category") || params.get("status") || level || params.get("threshold"));

  return (
    <section className="card p-4 sm:p-5 mb-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] items-end">
        <label className="block">
          <span className="flbl">Search</span>
          <span className="relative block">
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mute)] pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx={11} cy={11} r={7} />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              className="inp !h-11 !pl-11 text-sm"
              placeholder="Product name or SKU"
              autoComplete="off"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </span>
        </label>

        <label className="block">
          <span className="flbl">Category</span>
          <span className="sel-wrap block">
            <select className="inp !h-11 text-sm" value={params.get("category") ?? ""} onChange={(e) => push({ category: e.target.value })}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </span>
        </label>

        <label className="block">
          <span className="flbl">Status</span>
          <span className="sel-wrap block">
            <select className="inp !h-11 text-sm" value={params.get("status") ?? ""} onChange={(e) => push({ status: e.target.value })}>
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </span>
        </label>

        <label className="block">
          <span className="flbl">Alert at ≤</span>
          <span className="sel-wrap block">
            <select
              className="inp !h-11 text-sm"
              value={threshold}
              onChange={(e) => push({ threshold: Number(e.target.value) === defaultThreshold ? "" : e.target.value })}
            >
              {thresholds.map((t) => (
                <option key={t} value={t}>
                  {t} units{t === defaultThreshold ? " (default)" : ""}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="button"
          className="btn-ghost !h-11 justify-center"
          disabled={!hasFilters || pending}
          onClick={() => {
            setSearch("");
            startTransition(() => router.push(pathname));
          }}
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--line)]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Stock level">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              type="button"
              className="chip"
              aria-pressed={level === l.key}
              onClick={() => push({ level: l.key })}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-[var(--mute)] flex items-center gap-2">
          {pending && <span className="spin !w-3.5 !h-3.5" aria-hidden="true" />}
          <b className="text-[var(--ink)]">{matched}</b> product{matched === 1 ? "" : "s"} need attention
        </p>
      </div>
    </section>
  );
}
