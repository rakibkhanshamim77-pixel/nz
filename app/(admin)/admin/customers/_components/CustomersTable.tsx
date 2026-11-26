"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface CustomerRow {
  _id: string;
  name?: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
}

interface Props {
  customers: CustomerRow[];
  total: number;
  search: string;
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colors = [
    ["#dbeafe", "#2563eb"], ["#dcfce7", "#16a34a"], ["#fce7f3", "#db2777"],
    ["#fef3c7", "#d97706"], ["#ede9fe", "#7c3aed"], ["#ffedd5", "#ea580c"],
  ];
  const [bg, fg] = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-xs"
      style={{ width: size, height: size, background: bg, color: fg }}
    >
      {initials || "?"}
    </div>
  );
}

export default function CustomersTable({ customers, total, search }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(search);
  const [isPending, startTransition] = useTransition();

  function navigate(newQ: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newQ) params.set("q", newQ); else params.delete("q");
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(q);
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border items-stretch sm:items-center"
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}
      >
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: "var(--mute)" }}>
              <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or phone…"
              className="inp w-full pl-9"
            />
          </div>
          <button type="submit" disabled={isPending} className="btn-solid px-5 disabled:opacity-50 flex-shrink-0">
            {isPending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            ) : "Search"}
          </button>
        </form>
        <p className="text-sm flex-shrink-0" style={{ color: "var(--mute)" }}>
          Total <span className="font-semibold" style={{ color: "var(--ink)" }}>{total.toLocaleString()}</span> customer{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "color-mix(in srgb,var(--line) 40%,var(--surface))" }}>
              {["Customer", "Phone number", "Orders", "Total spent", "Last order"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--mute)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center" style={{ color: "var(--mute)" }}>
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                      <circle cx={9} cy={8} r="3.5" />
                      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
                    </svg>
                    <p>No customers found</p>
                  </div>
                </td>
              </tr>
            )}
            {customers.map((c, i) => (
              <tr
                key={c._id}
                className="transition-colors"
                style={{ borderBottom: i < customers.length - 1 ? "1px solid var(--line)" : "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb,var(--line) 20%,var(--surface))"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name || c.phone} />
                    <p className="font-semibold" style={{ color: "var(--ink)" }}>{c.name || "No name"}</p>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-sm" style={{ color: "var(--mute)" }}>{c.phone}</td>
                <td className="px-5 py-4">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                    style={{
                      background: c.orderCount > 0 ? "color-mix(in srgb,#6366f1 12%,transparent)" : "var(--line)",
                      color: c.orderCount > 0 ? "#4f46e5" : "var(--mute)",
                    }}
                  >
                    {c.orderCount}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-semibold" style={{ color: c.totalSpent > 0 ? "#16a34a" : "var(--mute)" }}>
                    {c.totalSpent > 0 ? `$${c.totalSpent.toLocaleString()}` : "—"}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs" style={{ color: "var(--mute)" }}>
                  {c.lastOrderAt
                    ? new Date(c.lastOrderAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {customers.map((c) => (
          <div key={c._id} className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={c.name || c.phone} />
              <div>
                <p className="font-semibold text-sm">{c.name || "No name"}</p>
                <p className="text-xs font-mono" style={{ color: "var(--mute)" }}>{c.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t" style={{ borderColor: "var(--line)" }}>
              <div>
                <p className="font-bold text-base" style={{ color: "#4f46e5" }}>{c.orderCount}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--mute)" }}>Orders</p>
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#16a34a" }}>
                  {c.totalSpent > 0 ? `$${c.totalSpent.toLocaleString()}` : "—"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--mute)" }}>Total</p>
              </div>
              <div>
                <p className="font-bold text-xs">
                  {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--mute)" }}>Last order</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
