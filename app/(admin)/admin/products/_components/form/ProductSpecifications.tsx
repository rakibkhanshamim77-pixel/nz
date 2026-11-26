"use client";

import { useState } from "react";
import { PRODUCT_LIMITS } from "@/db/validation/product.validation";
import type { Specification } from "./formTypes";
import FormSection, { FieldError, PlusIcon, XIcon } from "./FormSection";

const PRESET_KEYS = [
  "Brand", "Model", "Material", "Weight", "Dimensions",
  "Capacity", "Power", "Connectivity", "Warranty",
  "Country of Origin", "Package Contents", "Compatible With",
];

interface Props {
  specs: Specification[];
  error?: string;
  onChange: (specs: Specification[]) => void;
}

export default function ProductSpecifications({ specs, error, onChange }: Props) {
  const [draftKey, setDraftKey] = useState("");
  const [draftVal, setDraftVal] = useState("");
  const [localErr, setLocalErr] = useState("");
  const full = specs.length >= PRODUCT_LIMITS.specsMax;

  function add(key: string, value: string) {
    const k = key.trim();
    const v = value.trim();
    setLocalErr("");
    if (!k && !v) return;
    if (!k) return setLocalErr("Enter a specification label");
    if (!v) return setLocalErr("Enter a value for this specification");
    if (k.length > PRODUCT_LIMITS.specKeyMax)
      return setLocalErr(`Label must be under ${PRODUCT_LIMITS.specKeyMax} characters`);
    if (v.length > PRODUCT_LIMITS.specValueMax)
      return setLocalErr(`Value must be under ${PRODUCT_LIMITS.specValueMax} characters`);
    if (full) return setLocalErr(`You can add up to ${PRODUCT_LIMITS.specsMax} specifications`);
    onChange([...specs, { key: k, value: v }]);
    setDraftKey("");
    setDraftVal("");
  }

  function addFromPreset(key: string) {
    if (full) return;
    const existing = specs.find((s) => s.key.toLowerCase() === key.toLowerCase());
    if (existing) {
      setDraftKey(key);
      setDraftVal("");
      return;
    }
    setDraftKey(key);
    setDraftVal("");
  }

  function update(index: number, patch: Partial<Specification>) {
    onChange(specs.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  return (
    <FormSection
      id="sec-specs"
      title="Specifications"
      description="Key product details shown on the product page — works for any product type"
      icon={
        <>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </>
      }
    >
      {/* Existing specs list */}
      {specs.length > 0 && (
        <div className="rounded-2xl border border-[var(--line)] overflow-hidden mb-4">
          {specs.map((spec, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line)] last:border-b-0 bg-[var(--surface)] hover:bg-[var(--soft)] transition-colors"
            >
              <input
                className="flex-1 min-w-0 bg-transparent text-sm font-semibold outline-none rounded-md px-1 -mx-1 py-0.5 focus:bg-[var(--soft)]"
                value={spec.key}
                maxLength={PRODUCT_LIMITS.specKeyMax}
                placeholder="Label"
                aria-label={`Specification ${i + 1} label`}
                onChange={(e) => update(i, { key: e.target.value })}
              />
              <span className="text-[var(--mute)] text-xs shrink-0">:</span>
              <input
                className="flex-[2] min-w-0 bg-transparent text-sm text-[var(--mute)] outline-none rounded-md px-1 -mx-1 py-0.5 focus:bg-[var(--soft)] focus:text-[var(--ink)]"
                value={spec.value}
                maxLength={PRODUCT_LIMITS.specValueMax}
                placeholder="Value"
                aria-label={`Specification ${i + 1} value`}
                onChange={(e) => update(i, { value: e.target.value })}
              />
              <button
                type="button"
                className="icon-btn !w-8 !h-8 shrink-0"
                aria-label={`Remove specification ${i + 1}`}
                onClick={() => onChange(specs.filter((_, k) => k !== i))}
              >
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {specs.length === 0 && (
        <p className="text-sm text-[var(--mute)] mb-4">
          No specifications yet — optional. Add key details like brand, material, weight, etc.
        </p>
      )}

      {/* Add new spec */}
      <div className="flex gap-2 mb-3">
        <input
          className="inp !h-10 text-sm flex-1"
          placeholder="Label, e.g. Brand"
          maxLength={PRODUCT_LIMITS.specKeyMax}
          value={draftKey}
          aria-label="New specification label"
          onChange={(e) => setDraftKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draftKey, draftVal);
            }
          }}
        />
        <input
          className="inp !h-10 text-sm flex-[2]"
          placeholder="Value, e.g. Samsung"
          maxLength={PRODUCT_LIMITS.specValueMax}
          value={draftVal}
          aria-label="New specification value"
          onChange={(e) => setDraftVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draftKey, draftVal);
            }
          }}
        />
        <button
          type="button"
          className="btn-solid !h-10 !px-4 text-sm shrink-0"
          disabled={full || (!draftKey.trim() && !draftVal.trim())}
          onClick={() => add(draftKey, draftVal)}
        >
          <PlusIcon />
          Add
        </button>
      </div>

      {/* Preset label chips */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-[var(--mute)] mr-1">Quick labels:</span>
        {PRESET_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="q-chip"
            disabled={full}
            onClick={() => addFromPreset(key)}
          >
            {key}
          </button>
        ))}
      </div>

      <p className="hint mt-2">
        <FieldError id="specs-err" message={localErr || error} />
        {!localErr && !error && (
          <span className="text-[var(--mute)]">
            {specs.length} / {PRODUCT_LIMITS.specsMax} specifications
          </span>
        )}
      </p>
    </FormSection>
  );
}
