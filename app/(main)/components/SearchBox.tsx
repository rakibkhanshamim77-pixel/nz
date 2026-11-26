"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  image: string | null;
  salePrice: number;
  regularPrice: number;
  discount: number;
}

export default function SearchBox() {
  const { fmt: formatPrice } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQ = useDebounce(query, 350);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  // fetch when debounced value changes
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [debouncedQ]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <>
      {/* Trigger button (collapsed search bar in header) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className="hidden md:flex flex-1 max-w-sm ml-auto items-center gap-2 h-10 px-4 rounded-full bg-soft text-left cursor-text"
      >
        <SearchIcon />
        <span className="flex-1 text-sm text-mute truncate">
          Search t-shirts, polo, shirts…
        </span>
      </button>

      {/* Overlay + modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Search panel */}
          <div
            role="dialog"
            aria-label="Product search"
            className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 px-4"
          >
            <div className="bg-bg rounded-2xl shadow-[var(--shadow)] overflow-hidden border border-line">
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
                <SearchIcon className="w-4 h-4 shrink-0 text-wine" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search products"
                  placeholder="Search t-shirts, polo, shirts…"
                  className="flex-1 bg-transparent text-sm outline-none focus:outline-none focus-visible:outline-none placeholder:text-mute text-ink caret-wine"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                    aria-label="Clear"
                    className="shrink-0 text-mute hover:text-ink transition-colors"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-8 text-sm text-mute gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-wine border-t-transparent rounded-full animate-spin" />
                    Searching…
                  </div>
                )}

                {!loading && debouncedQ.length >= 2 && results.length === 0 && (
                  <p className="py-8 text-center text-sm text-mute">
                    No products found for &ldquo;{debouncedQ}&rdquo;
                  </p>
                )}

                {!loading && results.length > 0 && (
                  <ul>
                    {results.map((p) => (
                      <li key={p._id}>
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={close}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-soft transition-colors"
                        >
                          {/* Thumbnail */}
                          <div className="shrink-0 w-11 h-11 rounded-lg bg-soft overflow-hidden">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.name}
                                width={44}
                                height={44}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImagePlaceholderIcon />
                              </div>
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-semibold text-wine">
                                {formatPrice(p.salePrice)}
                              </span>
                              {p.discount > 0 && (
                                <span className="text-xs text-mute line-through">
                                  {formatPrice(p.regularPrice)}
                                </span>
                              )}
                              {p.discount > 0 && (
                                <span className="text-xs font-medium text-teal">
                                  -{p.discount}%
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronIcon />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Idle hint */}
                {!loading && (!debouncedQ || debouncedQ.length < 2) && (
                  <p className="py-6 text-center text-sm text-mute">
                    Type a product name…
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function SearchIcon({ className = "w-4 h-4 text-mute" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-mute shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg className="w-5 h-5 text-mute" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <circle cx={8.5} cy={8.5} r={1.5} />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}
