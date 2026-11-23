"use client";

import FormSection, { FieldError } from "../../products/_components/form/FormSection";
import {
  WALLET_IDS,
  WALLET_META,
  WALLET_TYPES,
  type PaymentSettings,
  type PaymentWallet,
  type WalletId,
} from "@/db/settings";
import type { SettingsFieldErrors } from "@/db/validation/settings.validation";

interface Props {
  value: PaymentSettings;
  errors: SettingsFieldErrors;
  onChange: (id: WalletId, patch: Partial<PaymentWallet>) => void;
}

export default function SettingsPayments({ value, errors, onChange }: Props) {
  const liveCount = WALLET_IDS.filter((id) => value[id].enabled && value[id].number).length;

  return (
    <FormSection
      id="sec-payments"
      title="Payment Numbers"
      description="The mobile wallet numbers customers send money to"
      icon={
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </>
      }
      action={
        <span className={`badge ${liveCount ? "solid" : "dash ghost"}`}>
          {liveCount ? `${liveCount} active` : "None set up"}
        </span>
      }
    >
      {liveCount === 0 && (
        <div className="rounded-2xl border-2 border-[var(--ink)] p-4 mb-5 text-sm" role="status">
          <b>Customers can&apos;t pay online yet.</b> Add at least one wallet number and switch it
          on, otherwise the payment page has nothing to show. Cash on delivery is unaffected.
        </div>
      )}

      <div className="space-y-4">
        {WALLET_IDS.map((id) => {
          const w = value[id];
          const meta = WALLET_META[id];
          const err = errors[`${id}Number`];

          return (
            <div
              key={id}
              className={`rounded-2xl border p-4 transition ${
                w.enabled ? "border-[var(--line)] bg-[var(--surface)]" : "border-[var(--line)] bg-[var(--soft)]"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-9 h-9 rounded-xl grid place-items-center text-white font-display font-extrabold text-xs shrink-0"
                  style={{ background: meta.color }}
                  aria-hidden="true"
                >
                  {meta.name.slice(0, 2)}
                </span>
                <b className="text-sm flex-1">{meta.name}</b>
                <label className="switch sm shrink-0">
                  <input
                    type="checkbox"
                    checked={w.enabled}
                    onChange={(e) => onChange(id, { enabled: e.target.checked })}
                    aria-label={`Accept payments via ${meta.name}`}
                  />
                  <span />
                </label>
              </div>

              <div className="grid sm:grid-cols-[minmax(0,1fr)_160px] gap-3">
                <label className="block">
                  <span className="flbl">Number</span>
                  <input
                    className={`inp !h-11 text-sm ${err ? "err" : ""}`}
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="01XXXXXXXXX"
                    value={w.number}
                    onChange={(e) => onChange(id, { number: e.target.value })}
                    aria-invalid={!!err}
                  />
                  <span className="hint">
                    <FieldError message={err} />
                  </span>
                </label>

                <label className="block">
                  <span className="flbl">Account type</span>
                  <span className="sel-wrap block">
                    <select
                      className="inp !h-11 text-sm"
                      value={w.type}
                      onChange={(e) =>
                        onChange(id, { type: e.target.value as PaymentWallet["type"] })
                      }
                      aria-label={`${meta.name} account type`}
                    >
                      {WALLET_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <p className="hint mt-4">
        These replace the <code>PAY_*</code> environment variables. Saving here takes effect without
        a restart.
      </p>
    </FormSection>
  );
}
