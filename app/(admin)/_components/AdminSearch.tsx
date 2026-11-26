"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

interface QuickLink {
  label: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
  keywords: string[];
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Orders",
    sub: "View all orders",
    href: "/admin/orders",
    keywords: ["order", "orders", "অর্ডার"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      </svg>
    ),
  },
  {
    label: "Products",
    sub: "Product list & stock",
    href: "/admin/products",
    keywords: ["product", "products", "পণ্য"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2" />
      </svg>
    ),
  },
  {
    label: "Customers",
    sub: "Customer list",
    href: "/admin/customers",
    keywords: ["customer", "customers", "কাস্টমার", "গ্রাহক"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    label: "Users",
    sub: "Staff & admins",
    href: "/admin/users",
    keywords: ["user", "users", "ব্যবহারকারী", "স্টাফ"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: "Reviews",
    sub: "Product reviews",
    href: "/admin/reviews",
    keywords: ["review", "reviews", "রিভিউ"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      </svg>
    ),
  },
  {
    label: "Content",
    sub: "Pages & banners",
    href: "/admin/content",
    keywords: ["content", "কন্টেন্ট", "page", "banner"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    label: "Settings",
    sub: "Store configuration",
    href: "/admin/settings",
    keywords: ["settings", "setting", "সেটিংস"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    label: "Coupons",
    sub: "Discount codes",
    href: "/admin/coupons",
    keywords: ["coupon", "coupons", "কুপন", "discount"],
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7" cy="7" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

// Which pages support ?q= deep search
const SEARCH_PAGES: { label: string; href: string; placeholder: string }[] = [
  { label: "Search orders", href: "/admin/orders", placeholder: "Order # or phone…" },
  { label: "Search products", href: "/admin/products", placeholder: "Product name…" },
  { label: "Search customers", href: "/admin/customers", placeholder: "Name or phone…" },
  { label: "Search users", href: "/admin/users", placeholder: "Name or phone…" },
];

interface Props {
  placeholder?: string;
}

export default function AdminSearch({ placeholder = "Search… (Ctrl+K)" }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const trimmed = q.trim().toLowerCase();

  // Filter quick links by keyword match
  const filteredLinks = trimmed
    ? QUICK_LINKS.filter((l) =>
        l.label.includes(trimmed) ||
        l.keywords.some((k) => k.includes(trimmed))
      )
    : QUICK_LINKS;

  // Current page's search section
  const currentSearch = SEARCH_PAGES.find((p) => pathname.startsWith(p.href));

  // Items: search action (if on a searchable page + query exists) + quick links
  const items: { type: "search" | "nav"; label: string; sub: string; href: string; icon: React.ReactNode }[] = [];

  if (trimmed && currentSearch) {
    items.push({
      type: "search",
      label: `"${q}" — ${currentSearch.label}`,
      sub: `${currentSearch.href}?q=${encodeURIComponent(q)}`,
      href: `${currentSearch.href}?q=${encodeURIComponent(q)}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
      ),
    });
  }

  // Also add deep-search shortcuts for all searchable pages when query exists
  if (trimmed) {
    for (const sp of SEARCH_PAGES) {
      if (!currentSearch || sp.href !== currentSearch.href) {
        items.push({
          type: "search",
          label: `"${q}" — ${sp.label}`,
          sub: `${sp.href}?q=${encodeURIComponent(q)}`,
          href: `${sp.href}?q=${encodeURIComponent(q)}`,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
          ),
        });
      }
    }
  }

  for (const l of filteredLinks) {
    items.push({ type: "nav", label: l.label, sub: l.sub, href: l.href, icon: l.icon });
  }

  const clampedActive = Math.min(active, Math.max(0, items.length - 1));

  function navigate(href: string) {
    setOpen(false);
    startTransition(() => { router.push(href); });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && items[clampedActive]) { navigate(items[clampedActive].href); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 flex-1 max-w-xs h-10 px-3 rounded-xl border text-sm transition-colors text-left"
        style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--mute)" }}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <span className="flex-1 truncate">{placeholder}</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border px-1 font-mono text-[10px]"
          style={{ borderColor: "var(--line)", color: "var(--mute)", background: "var(--soft)" }}>
          ⌘K
        </kbd>
      </button>

      {/* Mobile search icon */}
      <button type="button" onClick={() => setOpen(true)}
        className="sm:hidden w-10 h-10 rounded-xl border grid place-items-center transition-colors hover:bg-[var(--soft)]"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }} aria-label="Search">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start pt-[10vh] px-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>

          <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "var(--bg)", border: "1px solid var(--line)" }}>

            {/* Input row */}
            <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: "var(--line)", outline: "none" }}>
              <svg className="w-4 h-4 shrink-0" style={{ color: "var(--mute)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                className="flex-1 h-14 bg-transparent outline-none ring-0 border-0 text-sm placeholder:text-[var(--mute)] focus:outline-none focus:ring-0"
                placeholder="Type a name, order number, or page…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              {q && (
                <button onClick={() => setQ("")} className="shrink-0 w-6 h-6 rounded-lg grid place-items-center hover:bg-[var(--soft)] transition-colors" style={{ color: "var(--mute)" }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-6 items-center px-1.5 rounded border font-mono text-[11px] ml-1 shrink-0"
                style={{ borderColor: "var(--line)", color: "var(--mute)", background: "var(--soft)" }}>Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[380px] overflow-y-auto overscroll-contain py-2">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--mute)" }}>
                  No results found
                </div>
              ) : (
                <>
                  {trimmed && (
                    <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--mute)" }}>
                      Results
                    </p>
                  )}
                  {!trimmed && (
                    <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--mute)" }}>
                      Quick navigate
                    </p>
                  )}
                  {items.map((item, i) => (
                    <button key={item.href} type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => navigate(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{ background: i === clampedActive ? "var(--soft)" : "transparent" }}>
                      <span className="w-8 h-8 rounded-xl grid place-items-center shrink-0 flex-shrink-0"
                        style={{
                          background: item.type === "search" ? "var(--ink)" : "var(--surface)",
                          color: item.type === "search" ? "var(--bg)" : "var(--mute)",
                          border: "1px solid var(--line)",
                        }}>
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{item.label}</p>
                        <p className="text-xs truncate" style={{ color: "var(--mute)" }}>{item.sub}</p>
                      </div>
                      {i === clampedActive && (
                        <kbd className="shrink-0 h-5 px-1.5 rounded border font-mono text-[10px] grid place-items-center"
                          style={{ borderColor: "var(--line)", color: "var(--mute)", background: "var(--soft)" }}>↵</kbd>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t text-[11px]"
              style={{ borderColor: "var(--line)", color: "var(--mute)", background: "var(--surface)" }}>
              <span className="flex items-center gap-1.5">
                <kbd className="h-5 px-1 rounded border font-mono" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="h-5 px-1 rounded border font-mono" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>↵</kbd>
                Open
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="h-5 px-1 rounded border font-mono" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
