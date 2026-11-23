"use client";

import { useState } from "react";
import { PRESET_SIZES, PRODUCT_LIMITS, SIZE_PATTERN } from "@/db/validation/product.validation";
import { FieldError, PlusIcon, XIcon } from "./FormSection";

interface Props {
  sizes: string[];
  error?: string;
  onChange: (sizes: string[]) => void;
}

const order = (s: string) => {
  const i = (PRESET_SIZES as readonly string[]).indexOf(s);
  return i < 0 ? 99 : i;
};

export default function ProductSizes({ sizes, error, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [localErr, setLocalErr] = useState("");
  const full = sizes.length >= PRODUCT_LIMITS.sizesMax;

  function add(raw: string) {
    const v = raw.trim().toUpperCase();
    setLocalErr("");
    if (!v) return;
    if (!SIZE_PATTERN.test(v)) return setLocalErr("Use letters and numbers only (max 6)");
    if (sizes.includes(v)) return setLocalErr(`${v} is already added`);
    if (full) return setLocalErr(`You can add up to ${PRODUCT_LIMITS.sizesMax} sizes`);
    onChange([...sizes, v].sort((a, b) => order(a) - order(b)));
    setDraft("");
  }

  return (
    <div>
      <p className="sub-h">
        Sizes * <span className="text-[var(--mute)] font-medium">({sizes.length})</span>
      </p>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[38px]">
        {sizes.length ? (
          sizes.map((s) => (
            <span key={s} className="size-chip">
              {s}
              <button type="button" aria-label={`Remove size ${s}`} onClick={() => onChange(sizes.filter((x) => x !== s))}>
                <XIcon />
              </button>
            </span>
          ))
        ) : (
          <span className="text-sm text-[var(--mute)] self-center">No sizes yet — add at least one.</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-2 flex-1 min-w-[220px]">
          <input
            id="size-input"
            className={`inp !h-10 text-sm uppercase mono ${error ? "err" : ""}`}
            placeholder="Size name, e.g. 3XL"
            maxLength={6}
            autoComplete="off"
            value={draft}
            aria-label="New size"
            aria-invalid={!!error}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
          />
          <button type="button" className="btn-solid !h-10 !px-4 text-sm shrink-0" disabled={full} onClick={() => add(draft)}>
            <PlusIcon />
            Add Size
          </button>
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-xs text-[var(--mute)] mr-1">Quick add:</span>
          {PRESET_SIZES.map((s) => (
            <button key={s} type="button" className="q-chip" disabled={sizes.includes(s) || full} onClick={() => add(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <p className="hint">
        <FieldError id="sizes-err" message={localErr || error} />
      </p>
    </div>
  );
}
