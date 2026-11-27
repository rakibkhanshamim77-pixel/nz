"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/app/hooks/useDebounce";

interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  image: string | null;
  salePrice: number;
  regularPrice: number;
  discount: number;
}

function formatPrice(n: number) {
  return `BDT ${n.toLocaleString("en-US")}`;
}

export default function SearchBox() {
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
      <style>{`
        @keyframes sb-enter {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Mobile icon-only trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="পণ্য খুঁজুন"
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-soft transition-colors text-mute hover:text-ink"
      >
        <SearchIcon className="w-5 h-5" />
      </button>

      {/* Desktop pill trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="পণ্য খুঁজুন"
        className="hidden md:flex flex-1 max-w-sm ml-auto items-center gap-2 h-10 px-4 rounded-full bg-soft text-left cursor-text hover:bg-line transition-colors"
      >
        <SearchIcon />
        <span className="flex-1 text-sm text-mute truncate">
          টি-শার্ট, পোলো, শার্ট খুঁজুন…
        </span>
      </button>

      {/* Overlay + modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={close}
            aria-hidden="true"
          />

          {/* Search panel */}
          <div
            role="dialog"
            aria-label="পণ্য সার্চ"
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 px-4 sm:px-0"
          >
            <div className="bg-bg rounded-2xl shadow-2xl overflow-hidden border border-line" style={{ animation: "sb-enter 0.2s cubic-bezier(0.16,1,0.3,1) forwards" }}>
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
                <SearchIcon className="w-5 h-5 shrink-0 text-wine" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="পণ্য খুঁজুন"
                  placeholder="টি-শার্ট, পোলো, শার্ট খুঁজুন…"
                  className="flex-1 bg-transparent text-sm outline-none focus:outline-none focus-visible:outline-none placeholder:text-mute text-ink caret-wine"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                    aria-label="মুছুন"
                    className="shrink-0 text-mute hover:text-ink transition-colors p-1 rounded-md hover:bg-soft"
                  >
                    <CloseIcon />
                  </button>
                )}
                {/* Close modal button */}
                <button
                  type="button"
                  onClick={close}
                  aria-label="বন্ধ করুন"
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-soft hover:bg-line text-mute hover:text-ink transition-colors border border-line/60 ml-1"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 sm:max-h-96 overflow-y-auto" style={{ maxHeight: "min(400px, calc(80vh - 160px))" }}>
                {loading && (
                  <div className="flex items-center justify-center py-8 text-sm text-mute gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-wine border-t-transparent rounded-full animate-spin" />
                    খোঁজা হচ্ছে…
                  </div>
                )}

                {!loading && debouncedQ.length >= 2 && results.length === 0 && (
                  <p className="py-8 text-center text-sm text-mute">
                    &ldquo;{debouncedQ}&rdquo; — কোনো পণ্য পাওয়া যায়নি
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
                    পণ্যের নাম লিখুন…
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
