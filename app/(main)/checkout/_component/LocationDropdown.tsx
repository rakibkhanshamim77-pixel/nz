"use client";

import { useEffect, useRef, useState } from "react";

export interface LocationOption {
  id: number;
  name_bn: string;
  name_en: string;
}

interface Props {
  label: string;
  placeholder: string;
  options: LocationOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export default function LocationDropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = search.trim()
    ? options.filter(
        (o) =>
          o.name_bn.includes(search.trim()) ||
          o.name_en.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : options;

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  function handleSelect(id: number) {
    onChange(id);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) setOpen((v) => !v);
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={containerRef} className="field block relative">
      <span className="lbl">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "inp w-full flex items-center justify-between gap-2 text-left",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          error ? "border-red-500" : "",
          "select-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={
            selected ? "text-[var(--ink)]" : "text-[var(--mute)]"
          }
        >
          {selected ? selected.name_bn : placeholder}
        </span>
        {/* Arrow */}
        <svg
          className={`w-4 h-4 shrink-0 text-[var(--mute)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-[var(--shadow)] overflow-hidden"
          style={{ maxHeight: 300 }}
          role="listbox"
        >
          {/* Search */}
          <div className="p-2 border-b border-[var(--line)]">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mute)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[var(--line)] bg-[var(--soft)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>

          {/* Options list */}
          <ul
            className="overflow-y-auto"
            style={{ maxHeight: 220 }}
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--mute)] text-center">
                কোনো ফলাফল পাওয়া যায়নি
              </li>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <li
                    key={opt.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.id)}
                    className={[
                      "flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors",
                      isSelected
                        ? "bg-[var(--soft)] font-semibold text-[var(--ink)]"
                        : "hover:bg-[var(--soft)] text-[var(--ink)]",
                    ].join(" ")}
                  >
                    <span>{opt.name_bn}</span>
                    <span className="text-xs text-[var(--mute)] ml-2 shrink-0">
                      {opt.name_en}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[var(--ink)] ml-1 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
