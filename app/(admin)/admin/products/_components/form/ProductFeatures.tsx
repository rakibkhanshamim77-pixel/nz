"use client";

import { useState } from "react";
import { PRODUCT_LIMITS } from "@/db/validation/product.validation";
import FormSection, { FieldError, PlusIcon, XIcon } from "./FormSection";

interface Props {
  features: string[];
  error?: string;
  onChange: (features: string[]) => void;
}

export default function ProductFeatures({ features, error, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const full = features.length >= PRODUCT_LIMITS.featuresMax;

  const add = () => {
    const v = draft.trim();
    if (!v || full) return;
    onChange([...features, v]);
    setDraft("");
  };

  const move = (i: number, d: -1 | 1) => {
    const next = [...features];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <FormSection
      id="sec-features"
      title="Product Features"
      description="Short highlights shown as a list on the product page"
      icon={<path d="m5 12 5 5L20 7" />}
    >
      <ul className="feat-list mb-3">
        {features.length === 0 && (
          <li className="!border-dashed text-sm text-[var(--mute)] justify-center">No features yet</li>
        )}
        {features.map((f, i) => (
          <li key={`${i}-${features.length}`}>
            <span className="chk" aria-hidden="true">
              <svg fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path d="m5 12 5 5L20 7" /></svg>
            </span>
            <input
              className="flex-1 min-w-0 bg-transparent text-sm outline-none rounded-md px-1 -mx-1 py-0.5 focus:bg-[var(--soft)]"
              value={f}
              maxLength={PRODUCT_LIMITS.featureMax}
              aria-label={`Feature ${i + 1}`}
              onChange={(e) => onChange(features.map((x, k) => (k === i ? e.target.value : x)))}
              onBlur={() => !features[i]?.trim() && onChange(features.filter((_, k) => k !== i))}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), e.currentTarget.blur())}
            />
            <span className="flex flex-col">
              <button type="button" className="w-[22px] h-4 grid place-items-center text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-25" disabled={i === 0} aria-label="Move up" onClick={() => move(i, -1)}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.6} viewBox="0 0 24 24"><path d="m6 15 6-6 6 6" /></svg>
              </button>
              <button type="button" className="w-[22px] h-4 grid place-items-center text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-25" disabled={i === features.length - 1} aria-label="Move down" onClick={() => move(i, 1)}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.6} viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </span>
            <button type="button" className="icon-btn !w-8 !h-8" aria-label={`Remove feature ${i + 1}`} onClick={() => onChange(features.filter((_, k) => k !== i))}>
              <XIcon />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="inp !h-11 text-sm"
          placeholder="e.g. 100% combed cotton, 180 GSM"
          maxLength={PRODUCT_LIMITS.featureMax}
          autoComplete="off"
          value={draft}
          aria-label="New feature"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-solid !h-11 !px-4 text-sm shrink-0" disabled={full || !draft.trim()} onClick={add}>
          <PlusIcon />
          Add Feature
        </button>
      </div>
      <p className="hint">
        <FieldError id="features-err" message={error} />
      </p>
    </FormSection>
  );
}
