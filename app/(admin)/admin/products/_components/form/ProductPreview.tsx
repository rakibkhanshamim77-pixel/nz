"use client";

import { discountPercent, parseWhole } from "@/db/validation/product.validation";
import { colorHex } from "./ProductColors";
import { imageSrc, type CategoryOption, type ProductFormState } from "./formTypes";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  form: ProductFormState;
  categories: CategoryOption[];
}

export default function ProductPreview({ form, categories }: Props) {
  const { fmt: taka } = useCurrency();
  const regular = parseWhole(form.regularPrice) || 0;
  const saleRaw = parseWhole(form.salePrice);
  const sale = saleRaw > 0 && saleRaw < regular ? saleRaw : 0;
  const pct = discountPercent(regular, sale);
  const categoryLabel = categories.find((c) => c.value === form.category)?.label ?? form.category;
  const name = form.name.trim();

  return (
    <section className="card sec">
      <header className="sec-h !mb-4">
        <div>
          <h2 className="font-display">Store Preview</h2>
          <p>How it appears in the shop grid</p>
        </div>
      </header>
      <div className="rounded-2xl border border-[var(--line)] p-3 max-w-[260px] mx-auto xl:max-w-none">
        <div className="relative aspect-square rounded-xl bg-[var(--soft)] grid place-items-center overflow-hidden">
          {form.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc(form.thumbnail)} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-12 h-12 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="m21 16-5-5-8 8" />
            </svg>
          )}
          {pct > 0 && (
            <span className="absolute top-2.5 left-2.5 h-7 px-2.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-xs font-bold grid place-items-center">
              −{pct}%
            </span>
          )}
          {form.isFeatured && (
            <span className="absolute top-2.5 right-2.5 h-7 px-2.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-bold grid place-items-center">
              ★ Featured
            </span>
          )}
          {form.status !== "active" && (
            <span className="absolute bottom-2.5 left-2.5 badge ghost !bg-[var(--surface)]">
              {form.status === "draft" ? "Hidden · Draft" : "Scheduled"}
            </span>
          )}
        </div>
        <div className="pt-3 px-1">
          <b className={`block truncate ${name ? "" : "text-[var(--mute)]"}`}>{name || "Product name"}</b>
          <span className="text-xs text-[var(--mute)]">{categoryLabel || "Category"}</span>
          <div className="flex items-center gap-2 mt-1">
            <b className="font-display">{taka(sale || regular)}</b>
            {sale > 0 && <span className="text-sm text-[var(--mute)] line-through">{taka(regular)}</span>}
          </div>
          {form.colors.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {form.colors.slice(0, 6).map((c) => (
                <span key={c} className="sw-dot" title={c} style={{ background: colorHex(c) ?? "var(--soft)" }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
