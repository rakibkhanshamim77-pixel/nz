"use client";

import FormSection, { FieldError } from "../../products/_components/form/FormSection";
import type { DeliverySettings } from "@/db/settings";
import type { SettingsFieldErrors } from "@/db/validation/settings.validation";

interface Props {
  value: DeliverySettings;
  errors: SettingsFieldErrors;
  onChange: (patch: Partial<DeliverySettings>) => void;
}

const taka = (n: number) => "৳" + n.toLocaleString("en-US");

export default function SettingsDelivery({ value, errors, onChange }: Props) {
  return (
    <FormSection
      id="sec-delivery"
      title="Delivery Charges"
      description="Applied at checkout and recalculated on the server when an order is placed"
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
          <span className="flbl">Inside Dhaka (৳) *</span>
          <input
            className={`inp ${errors.insideDhaka ? "err" : ""}`}
            inputMode="numeric"
            value={value.insideDhaka}
            onChange={(e) => onChange({ insideDhaka: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            aria-invalid={!!errors.insideDhaka}
          />
          <span className="hint">
            <FieldError message={errors.insideDhaka} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">Outside Dhaka (৳) *</span>
          <input
            className={`inp ${errors.outsideDhaka ? "err" : ""}`}
            inputMode="numeric"
            value={value.outsideDhaka}
            onChange={(e) => onChange({ outsideDhaka: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            aria-invalid={!!errors.outsideDhaka}
          />
          <span className="hint">
            <FieldError message={errors.outsideDhaka} />
          </span>
        </label>
      </div>

      <div className="h-px bg-[var(--line)] my-6" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="sub-h !mb-0.5">Free delivery over a set amount</p>
          <p className="text-xs text-[var(--mute)] leading-relaxed">
            While this is off, every order pays the charge above. Turning it on changes what
            customers are charged.
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
          <span className="flbl">Order subtotal for free delivery (৳)</span>
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
            Dhaka, {taka(value.freeDeliveryEnabled ? value.freeDeliveryThreshold - 1 : 1000)}{" "}
            subtotal → <b className="text-[var(--ink)]">{taka(value.insideDhaka)}</b>
          </li>
          <li>
            Outside Dhaka, {taka(value.freeDeliveryEnabled ? value.freeDeliveryThreshold - 1 : 1000)}{" "}
            subtotal → <b className="text-[var(--ink)]">{taka(value.outsideDhaka)}</b>
          </li>
          {value.freeDeliveryEnabled && (
            <li>
              Any district, {taka(value.freeDeliveryThreshold)} or more →{" "}
              <b className="text-[var(--ink)]">Free</b>
            </li>
          )}
        </ul>
      </div>
    </FormSection>
  );
}
