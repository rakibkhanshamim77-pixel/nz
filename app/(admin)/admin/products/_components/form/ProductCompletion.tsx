"use client";

import { PRODUCT_LIMITS, parseWhole } from "@/db/validation/product.validation";
import type { ProductFormState } from "./formTypes";

function descriptionChars(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().length;
}

export default function ProductCompletion({ form }: { form: ProductFormState }) {
  const checks: [string, boolean, boolean][] = [
    ["Product name", form.name.trim().length >= PRODUCT_LIMITS.nameMin, true],
    ["SKU", form.sku.trim().length >= 4, true],
    ["Category", !!form.category, true],
    ["Description", descriptionChars(form.description) >= PRODUCT_LIMITS.descMinChars, true],
    ["Regular price", parseWhole(form.regularPrice) > 0, true],
    ["Stock quantity", form.stock !== "" && !Number.isNaN(parseWhole(form.stock)), true],
    ["Main image", !!form.thumbnail, true],
    ["At least one size", form.sizes.length > 0, true],
    ["Gallery images", form.gallery.length > 0, false],
    ["Size chart", form.sizeChart.some((r) => r.chest || r.length || r.sleeve), false],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  const pct = Math.round((done / checks.length) * 100);
  const requiredLeft = checks.filter(([, ok, req]) => req && !ok).length;

  return (
    <section className="card sec">
      <header className="sec-h !mb-3">
        <div className="flex-1">
          <h2 className="font-display">Completion</h2>
          <p>{requiredLeft ? `${requiredLeft} required item${requiredLeft > 1 ? "s" : ""} left` : "Ready to save"}</p>
        </div>
        <b className="font-display text-lg">{pct}%</b>
      </header>
      <div className="mini mb-4" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Form completion">
        <span style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-2 text-sm">
        {checks.map(([label, ok, req]) => (
          <li key={label} className="flex items-center gap-2.5">
            <span className={`w-5 h-5 rounded-full grid place-items-center shrink-0 ${ok ? "bg-[var(--ink)] text-[var(--bg)]" : "border border-[var(--line)]"}`}>
              {ok && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path d="m5 12 5 5L20 7" /></svg>
              )}
            </span>
            <span className={ok ? "chk-done" : ""}>
              {label}
              {!req && <span className="text-[var(--mute)]"> (optional)</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
