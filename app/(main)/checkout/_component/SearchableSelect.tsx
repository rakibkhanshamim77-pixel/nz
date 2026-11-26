"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  prefix?: string; // e.g. flag emoji
}

interface Props {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  required = false,
  searchable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
  }, [open, searchable]);

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="field block min-w-0 relative">
      <span className="lbl">
        {label}
        {required && " *"}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`inp w-full text-left flex items-center justify-between gap-2 max-sm:!text-base ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{ paddingRight: "12px" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selected ? (
            <>
              {selected.prefix && (
                <span className="shrink-0">{selected.prefix}</span>
              )}
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span className="text-[var(--mute)]">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-[var(--mute)] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-2xl border border-[var(--line)] shadow-xl overflow-hidden"
          style={{ background: "var(--bg)", width: "100%", minWidth: "200px" }}
          role="listbox"
        >
          {searchable && (
            <div className="p-2 border-b border-[var(--line)]">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--line)] outline-none"
                style={{ background: "var(--soft)", color: "var(--ink)" }}
              />
            </div>
          )}
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <p className="text-sm text-[var(--mute)] text-center py-4">
                No results
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left hover:bg-[var(--soft)] transition-colors ${
                    opt.value === value ? "bg-[var(--soft)] font-semibold" : ""
                  }`}
                  style={{ color: "var(--ink)" }}
                >
                  {opt.prefix && <span className="shrink-0">{opt.prefix}</span>}
                  <span>{opt.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
