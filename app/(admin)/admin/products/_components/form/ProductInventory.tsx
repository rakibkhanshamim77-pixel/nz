"use client";

import { stockLevel } from "@/app/utils/inventory";
import { parseWhole } from "@/db/validation/product.validation";
import FormSection, { FieldError } from "./FormSection";
import type { FormErrors, FormPatch } from "./formTypes";

interface Props {
  stock: string;
  lowStockThreshold: number;
  errors: FormErrors;
  onChange: (patch: FormPatch) => void;
}

const LEVEL_TEXT = {
  out: "Out of stock — customers can't order this product",
  critical: "Critically low — restock soon",
  low: "Low stock — it will appear on the Low Stock page",
  ok: "In stock",
} as const;

export default function ProductInventory({ stock, lowStockThreshold, errors, onChange }: Props) {
  const value = parseWhole(stock);
  const level = Number.isNaN(value) ? null : stockLevel(value, lowStockThreshold);

  const step = (delta: number) => {
    const base = Number.isNaN(value) ? 0 : value;
    onChange({ stock: String(Math.max(0, base + delta)) });
  };

  return (
    <FormSection
      id="sec-inventory"
      title="Inventory"
      description={`Units available to sell · low-stock alert at ${lowStockThreshold} or fewer`}
      icon={<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>}
    >
      <div className="grid sm:grid-cols-2 gap-4 items-start">
        <label className="block">
          <span className="flbl">Stock Quantity *</span>
          <span className="flex gap-2">
            <button type="button" className="btn-ghost !h-[52px] !px-4 shrink-0" aria-label="Decrease stock" onClick={() => step(-1)}>
              −
            </button>
            <input
              type="text"
              inputMode="numeric"
              className={`inp text-center font-display font-bold text-lg ${errors.stock ? "err" : ""}`}
              placeholder="0"
              value={stock}
              aria-invalid={!!errors.stock}
              aria-describedby="stock-err"
              onChange={(e) => onChange({ stock: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            />
            <button type="button" className="btn-ghost !h-[52px] !px-4 shrink-0" aria-label="Increase stock" onClick={() => step(1)}>
              +
            </button>
          </span>
          <span className="hint">
            <FieldError id="stock-err" message={errors.stock} />
          </span>
        </label>

        {level && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 flex items-center gap-3 sm:mt-[22px]">
            <span className={`badge ${level === "out" ? "solid" : level === "ok" ? "ghost" : "dash"}`}>
              {level === "out" ? "Out" : level === "ok" ? "OK" : level === "critical" ? "Critical" : "Low"}
            </span>
            <span className="text-sm text-[var(--mute)]">{LEVEL_TEXT[level]}</span>
          </div>
        )}
      </div>
    </FormSection>
  );
}
