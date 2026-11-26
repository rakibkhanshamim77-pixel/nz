"use client";

import FormSection, { FieldError } from "../../products/_components/form/FormSection";
import { SETTINGS_LIMITS, type StoreSettings } from "@/db/settings";
import type { SettingsFieldErrors } from "@/db/validation/settings.validation";
import { COUNTRIES } from "@/data/countries";

interface Props {
  value: StoreSettings;
  errors: SettingsFieldErrors;
  onChange: (patch: Partial<StoreSettings>) => void;
}

export default function SettingsStoreInfo({ value, errors, onChange }: Props) {
  return (
    <FormSection
      id="sec-store"
      title="Store Information"
      description="Shown to customers in the footer and on order emails"
      icon={
        <>
          <path d="M3 9.5 12 4l9 5.5" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="flbl">Store name *</span>
          <input
            className={`inp ${errors.name ? "err" : ""}`}
            value={value.name}
            maxLength={SETTINGS_LIMITS.nameMax}
            onChange={(e) => onChange({ name: e.target.value })}
            aria-invalid={!!errors.name}
          />
          <span className="hint">
            <FieldError message={errors.name} />
          </span>
        </label>

        <label className="block sm:col-span-2">
          <span className="flbl">Store country *</span>
          <p className="text-xs text-[var(--mute)] mb-1.5">
            Used to determine domestic vs international delivery charges at checkout
          </p>
          <div className="select-wrap">
            <select
              className={`inp ${errors.country ? "err" : ""}`}
              value={value.country}
              onChange={(e) => onChange({ country: e.target.value })}
              aria-invalid={!!errors.country}
            >
              <option value="">Select country…</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
          <span className="hint">
            <FieldError message={errors.country} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">Support email</span>
          <input
            type="email"
            className={`inp ${errors.supportEmail ? "err" : ""}`}
            value={value.supportEmail}
            maxLength={SETTINGS_LIMITS.emailMax}
            placeholder="support@example.com"
            onChange={(e) => onChange({ supportEmail: e.target.value })}
            aria-invalid={!!errors.supportEmail}
          />
          <span className="hint">
            <FieldError message={errors.supportEmail} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">Support phone</span>
          <input
            className={`inp ${errors.supportPhone ? "err" : ""}`}
            value={value.supportPhone}
            type="tel"
            inputMode="tel"
            placeholder="+1 555 000 0000"
            onChange={(e) => onChange({ supportPhone: e.target.value })}
            aria-invalid={!!errors.supportPhone}
          />
          <span className="hint">
            <FieldError message={errors.supportPhone} />
          </span>
        </label>

        <label className="block sm:col-span-2">
          <span className="flbl">Address</span>
          <input
            className={`inp ${errors.address ? "err" : ""}`}
            value={value.address}
            maxLength={SETTINGS_LIMITS.addressMax}
            placeholder="House, road, area, city"
            onChange={(e) => onChange({ address: e.target.value })}
            aria-invalid={!!errors.address}
          />
          <span className="hint">
            <FieldError message={errors.address} />
          </span>
        </label>
      </div>

    </FormSection>
  );
}
