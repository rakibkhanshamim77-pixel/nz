"use client";

import { useState } from "react";
import { SHOP_COLOR_OPTIONS } from "@/app/(main)/shop/_component/shop.constants";
import { PRODUCT_LIMITS } from "@/db/validation/product.validation";
import { FieldError, PlusIcon, XIcon } from "./FormSection";

interface Props {
  colors: string[];
  error?: string;
  onChange: (colors: string[]) => void;
}

export function colorHex(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return SHOP_COLOR_OPTIONS.find((c) => c.name.toLowerCase() === key)?.hex;
}

export default function ProductColors({ colors, error, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [localErr, setLocalErr] = useState("");
  const has = (n: string) => colors.some((c) => c.toLowerCase() === n.trim().toLowerCase());
  const full = colors.length >= PRODUCT_LIMITS.colorsMax;

  function add(raw: string) {
    const name = raw.trim().replace(/\s+/g, " ");
    setLocalErr("");
    if (!name) return;
    if (name.length > PRODUCT_LIMITS.colorMax) return setLocalErr(`Keep colour names under ${PRODUCT_LIMITS.colorMax} characters`);
    if (has(name)) return setLocalErr(`${name} is already added`);
    if (full) return setLocalErr(`You can add up to ${PRODUCT_LIMITS.colorsMax} colours`);
    // Match the shop palette's spelling so storefront colour filters find this product
    const preset = SHOP_COLOR_OPTIONS.find((c) => c.name.toLowerCase() === name.toLowerCase());
    onChange([...colors, preset?.name ?? name]);
    setDraft("");
  }

  return (
    <div>
      <p className="sub-h">
        Colours <span className="text-[var(--mute)] font-medium">({colors.length})</span>
      </p>

      <div className="flex flex-wrap gap-2 mb-3 min-h-[38px]">
        {colors.length === 0 && <span className="text-sm text-[var(--mute)] self-center">No colours yet — optional.</span>}
        {colors.map((c) => (
          <span key={c} className="inline-flex items-center gap-2 h-[38px] pl-2 pr-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold">
            <span className="sw-dot" style={{ background: colorHex(c) ?? "var(--soft)" }} aria-hidden="true" />
            {c}
            <button
              type="button"
              className="w-7 h-7 rounded-lg grid place-items-center text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--soft)]"
              aria-label={`Remove colour ${c}`}
              onClick={() => onChange(colors.filter((x) => x !== c))}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="inp !h-10 text-sm"
          placeholder="Colour name, e.g. Charcoal"
          maxLength={PRODUCT_LIMITS.colorMax}
          value={draft}
          aria-label="New colour name"
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
          Add Colour
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center mt-3">
        <span className="text-xs text-[var(--mute)] mr-1">Shop palette:</span>
        {SHOP_COLOR_OPTIONS.map((c) => (
          <button
            key={c.name}
            type="button"
            className="q-chip inline-flex items-center gap-1.5"
            disabled={has(c.name) || full}
            onClick={() => add(c.name)}
          >
            <span className="sw-dot !w-3 !h-3" style={{ background: c.hex }} aria-hidden="true" />
            {c.name}
          </button>
        ))}
      </div>
      <p className="hint">
        <FieldError message={localErr || error} />
      </p>
    </div>
  );
}
