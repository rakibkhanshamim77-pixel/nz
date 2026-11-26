"use client";

import { discountPercent, parseWhole } from "@/db/validation/product.validation";
import FormSection, { FieldError } from "./FormSection";
import { type FormErrors, type FormPatch } from "./formTypes";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  regularPrice: string;
  salePrice: string;
  errors: FormErrors;
  onChange: (patch: FormPatch) => void;
}

const digitsOnly = (v: string) => v.replace(/\D/g, "").slice(0, 7);

export default function ProductPricing({ regularPrice, salePrice, errors, onChange }: Props) {
  const { currency, fmt: taka } = useCurrency();
  const regular = parseWhole(regularPrice);
  const sale = parseWhole(salePrice);
  const pct = discountPercent(regular, sale);
  const saleTooHigh = salePrice !== "" && regular > 0 && sale >= regular;
  const saleError = errors.salePrice ?? (saleTooHigh ? "Sale price must be lower than the regular price" : undefined);

  return (
    <FormSection
      id="sec-pricing"
      title="Pricing"
      description={`${currency.code} (${currency.symbol}), whole amounts`}
      icon={<><path d="m14 4-8 8 6 6 8-8V4z" /><circle cx="16" cy="8" r="1.4" /></>}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="flbl">Regular Price *</span>
          <span className="money">
            <span className="cur">{currency.symbol}</span>
            <input
              type="text"
              inputMode="numeric"
              className={`inp ${errors.regularPrice ? "err" : ""}`}
              placeholder="0"
              value={regularPrice}
              aria-invalid={!!errors.regularPrice}
              aria-describedby="regularPrice-err"
              onChange={(e) => onChange({ regularPrice: digitsOnly(e.target.value) })}
            />
          </span>
          <span className="hint">
            <FieldError id="regularPrice-err" message={errors.regularPrice} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">
            Sale Price <span className="font-medium">(optional)</span>
          </span>
          <span className="money">
            <span className="cur">{currency.symbol}</span>
            <input
              type="text"
              inputMode="numeric"
              className={`inp ${saleError ? "err" : ""}`}
              placeholder="0"
              value={salePrice}
              aria-invalid={!!saleError}
              aria-describedby="salePrice-err"
              onChange={(e) => onChange({ salePrice: digitsOnly(e.target.value) })}
            />
          </span>
          <span className="hint">
            <FieldError id="salePrice-err" message={saleError} />
            {pct > 0 && (
              <span className="ml-auto font-semibold text-[var(--ink)]">
                {pct}% off · saves {taka(regular - sale)}
              </span>
            )}
          </span>
        </label>
      </div>
    </FormSection>
  );
}
