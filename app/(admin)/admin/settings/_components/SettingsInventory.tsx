"use client";

import FormSection, { FieldError } from "../../products/_components/form/FormSection";
import { LOW_STOCK_THRESHOLD_OPTIONS } from "@/app/utils/inventory";
import type { InventorySettings } from "@/db/settings";
import type { SettingsFieldErrors } from "@/db/validation/settings.validation";

interface Props {
  value: InventorySettings;
  errors: SettingsFieldErrors;
  onChange: (patch: Partial<InventorySettings>) => void;
}

export default function SettingsInventory({ value, errors, onChange }: Props) {
  return (
    <FormSection
      id="sec-inventory"
      title="Inventory"
      description="When a product counts as low stock"
      icon={
        <>
          <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
        </>
      }
    >
      <label className="block max-w-[260px]">
        <span className="flbl">Low stock threshold *</span>
        <input
          className={`inp ${errors.lowStockThreshold ? "err" : ""}`}
          inputMode="numeric"
          value={value.lowStockThreshold}
          onChange={(e) =>
            onChange({ lowStockThreshold: Number(e.target.value.replace(/\D/g, "")) || 0 })
          }
          aria-invalid={!!errors.lowStockThreshold}
        />
        <span className="hint">
          <FieldError message={errors.lowStockThreshold} />
        </span>
      </label>

      <div className="flex flex-wrap gap-1.5 items-center mt-3">
        <span className="text-xs text-[var(--mute)] mr-1">Common:</span>
        {LOW_STOCK_THRESHOLD_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            className="q-chip"
            disabled={value.lowStockThreshold === n}
            onClick={() => onChange({ lowStockThreshold: n })}
          >
            {n}
          </button>
        ))}
      </div>

      <p className="hint mt-4">
        A product with {value.lowStockThreshold || 0} or fewer in stock shows on the Low Stock page
        and in the sidebar count. This replaces the <code>LOW_STOCK_THRESHOLD</code> environment
        variable.
      </p>

    </FormSection>
  );
}
