"use client";

import FormSection, { FieldError } from "../../products/_components/form/FormSection";
import type { DeliverySettings } from "@/db/settings";
import type { SettingsFieldErrors } from "@/db/validation/settings.validation";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  value: DeliverySettings;
  errors: SettingsFieldErrors;
  onChange: (patch: Partial<DeliverySettings>) => void;
}

export default function SettingsDelivery({ value, errors, onChange }: Props) {
  const { currency, fmt } = useCurrency();
  return (
    <FormSection
      id="sec-delivery"
      title="Delivery Charges"
      description="Applied at checkout based on the customer's country. Set your store's country in Store Information above."
      icon={
        <>
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h4l3 3v2h-7z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="18" cy="18" r="1.6" />
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="flbl">Domestic delivery ({currency.symbol}) *</span>
          <p className="text-xs text-[var(--mute)] mb-1.5">
            Customers from the same country as your store
          </p>
          <input
            className={`inp ${errors.domestic ? "err" : ""}`}
            inputMode="numeric"
            value={value.domestic}
            onChange={(e) => onChange({ domestic: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            aria-invalid={!!errors.domestic}
          />
          <span className="hint">
            <FieldError message={errors.domestic} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">International delivery ({currency.symbol}) *</span>
          <p className="text-xs text-[var(--mute)] mb-1.5">
            Customers from any other country
          </p>
          <input
            className={`inp ${errors.international ? "err" : ""}`}
            inputMode="numeric"
            value={value.international}
            onChange={(e) => onChange({ international: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            aria-invalid={!!errors.international}
          />
          <span className="hint">
            <FieldError message={errors.international} />
          </span>
        </label>
      </div>

      <div className="h-px bg-[var(--line)] my-6" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="sub-h !mb-0.5">Free delivery over a set amount</p>
          <p className="text-xs text-[var(--mute)] leading-relaxed">
            Applies to domestic orders only. International customers always pay the
            international rate above.
          </p>
        </div>
        <label className="switch shrink-0 mt-1">
          <input
            type="checkbox"
            checked={value.freeDeliveryEnabled}
            onChange={(e) => onChange({ freeDeliveryEnabled: e.target.checked })}
            aria-label="Enable free delivery over a set amount"
          />
          <span />
        </label>
      </div>

      {value.freeDeliveryEnabled && (
        <label className="block mt-4 max-w-[260px]">
          <span className="flbl">Order subtotal for free delivery ({currency.symbol})</span>
          <input
            className={`inp ${errors.freeDeliveryThreshold ? "err" : ""}`}
            inputMode="numeric"
            value={value.freeDeliveryThreshold}
            onChange={(e) =>
              onChange({ freeDeliveryThreshold: Number(e.target.value.replace(/\D/g, "")) || 0 })
            }
            aria-invalid={!!errors.freeDeliveryThreshold}
          />
          <span className="hint">
            <FieldError message={errors.freeDeliveryThreshold} />
          </span>
        </label>
      )}

      <div className="rounded-2xl bg-[var(--soft)] p-4 mt-5 text-sm">
        <p className="flbl !mb-2">What a customer pays</p>
        <ul className="space-y-1 text-[var(--mute)]">
          <li>
            🏠 Domestic,{" "}
            {fmt(value.freeDeliveryEnabled ? value.freeDeliveryThreshold - 1 : 1000)} subtotal →{" "}
            <b className="text-[var(--ink)]">{fmt(value.domestic)}</b>
          </li>
          {value.freeDeliveryEnabled && (
            <li>
              🏠 Domestic, {fmt(value.freeDeliveryThreshold)} or more →{" "}
              <b className="text-[var(--ink)]">Free</b>
            </li>
          )}
          <li>
            🌍 International (any other country) →{" "}
            <b className="text-[var(--ink)]">{fmt(value.international)}</b>
            <span className="text-xs ml-1">(free delivery doesn&apos;t apply)</span>
          </li>
        </ul>
      </div>

    </FormSection>
  );
}
