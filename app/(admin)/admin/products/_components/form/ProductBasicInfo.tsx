"use client";

import { PRODUCT_LIMITS } from "@/db/validation/product.validation";
import FormSection, { FieldError } from "./FormSection";
import type { CategoryOption, FormErrors, FormPatch } from "./formTypes";

interface Props {
  name: string;
  sku: string;
  category: string;
  categories: CategoryOption[];
  errors: FormErrors;
  onChange: (patch: FormPatch) => void;
  children?: React.ReactNode;
}

function generateSku(name: string, category: string): string {
  const code = (category.replace(/[^a-z0-9]/gi, "").slice(0, 2) || "GN").toUpperCase();
  const initials = (name.match(/\b[a-z]/gi) ?? ["X"]).slice(0, 2).join("").toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NZ-${code}-${initials}${rand}`;
}

export default function ProductBasicInfo({ name, sku, category, categories, errors, onChange, children }: Props) {
  return (
    <FormSection
      id="sec-basic"
      title="Basic Information"
      description="Name, SKU, category and description"
      icon={<><path d="M6 4h12v16H6z" /><path d="M9 9h6M9 13h6M9 17h3" /></>}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="flbl">Product Name *</span>
          <input
            className={`inp ${errors.name ? "err" : ""}`}
            maxLength={PRODUCT_LIMITS.nameMax}
            placeholder="e.g. Midnight Oversized Tee"
            autoComplete="off"
            value={name}
            aria-invalid={!!errors.name}
            aria-describedby="name-err"
            onChange={(e) => onChange({ name: e.target.value })}
          />
          <span className="hint">
            <FieldError id="name-err" message={errors.name} />
            <span className="ml-auto">
              {name.length} / {PRODUCT_LIMITS.nameMax}
            </span>
          </span>
        </label>

        <label className="block">
          <span className="flbl">Product SKU *</span>
          <span className="relative block">
            <input
              className={`inp mono uppercase !pr-[104px] ${errors.sku ? "err" : ""}`}
              maxLength={20}
              placeholder="NZ-OT-1025"
              autoComplete="off"
              spellCheck={false}
              value={sku}
              aria-invalid={!!errors.sku}
              aria-describedby="sku-err"
              onChange={(e) => onChange({ sku: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-3 rounded-xl bg-[var(--soft)] hover:bg-[var(--line)] text-xs font-bold"
              onClick={() => onChange({ sku: generateSku(name, category) })}
            >
              Generate
            </button>
          </span>
          <span className="hint">
            <FieldError id="sku-err" message={errors.sku} />
          </span>
        </label>

        <label className="block">
          <span className="flbl">Category *</span>
          <span className="sel-wrap block">
            <select
              className={`inp ${errors.category ? "err" : ""}`}
              value={category}
              aria-invalid={!!errors.category}
              aria-describedby="category-err"
              onChange={(e) => onChange({ category: e.target.value })}
            >
              <option value="">{categories.length ? "Select a category" : "No categories yet"}</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </span>
          <span className="hint">
            <FieldError id="category-err" message={errors.category} />
            {!categories.length && (
              <a href="/admin/categories" className="ml-auto font-semibold underline underline-offset-2">
                Create one
              </a>
            )}
          </span>
        </label>

        {children && <div className="sm:col-span-2">{children}</div>}
      </div>
    </FormSection>
  );
}
