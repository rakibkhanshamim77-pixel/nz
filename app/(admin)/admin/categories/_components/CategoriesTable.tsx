"use client";

import Link from "next/link";
import CategoryCardPreview from "./CategoryCardPreview";
import type { CategoryRow } from "./types";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  rows: CategoryRow[];
  togglingId: string | null;
  onEdit: (c: CategoryRow) => void;
  onDelete: (c: CategoryRow) => void;
  onToggleActive: (c: CategoryRow) => void;
}

const productsHref = (c: CategoryRow) => `/admin/products?category=${encodeURIComponent(c.filter)}`;

function Actions({ c, onEdit, onDelete }: { c: CategoryRow; onEdit: Props["onEdit"]; onDelete: Props["onDelete"] }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" className="icon-btn tip-wrap" data-tip="Edit" aria-label={`Edit ${c.name}`} onClick={() => onEdit(c)}>
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13 7 4 4" /></svg>
      </button>
      <button type="button" className="icon-btn solid tip-wrap" data-tip="Delete" aria-label={`Delete ${c.name}`} onClick={() => onDelete(c)}>
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
      </button>
    </div>
  );
}

function VisibleSwitch({ c, busy, onToggle }: { c: CategoryRow; busy: boolean; onToggle: () => void }) {
  return (
    <span className={`switch ${busy ? "opacity-50" : ""}`}>
      <input type="checkbox" checked={c.isActive} disabled={busy} onChange={onToggle} aria-label={`${c.name} visible on store`} />
      <span />
    </span>
  );
}

export default function CategoriesTable({ rows, togglingId, onEdit, onDelete, onToggleActive }: Props) {
  const { fmt } = useCurrency();
  return (
    <>
      <section className="card hidden md:block overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="ptbl">
            <thead>
              <tr>
                <th className="w-[64px]"><span className="sr-only">Preview</span></th>
                <th>Category</th>
                <th>Slug</th>
                <th>Filter value</th>
                <th className="text-right">Products</th>
                <th className="text-right">From</th>
                <th className="text-center">Order</th>
                <th className="text-center">Visible</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="row-in">
                  <td>
                    <CategoryCardPreview compact name={c.name} label={c.label} startingPrice={c.startingPrice} bgColor={c.bgColor} accentColor={c.accentColor} />
                  </td>
                  <td>
                    <button type="button" className="font-semibold hover:underline underline-offset-4 text-left max-w-[220px] truncate block" onClick={() => onEdit(c)}>
                      {c.name}
                    </button>
                    <span className="text-xs text-[var(--mute)] flex items-center gap-1.5">
                      {c.label || "No tag"}
                      {c.isFeatured && <span className="badge !h-5 !px-1.5 !text-[10px]">★ Featured</span>}
                    </span>
                  </td>
                  <td><span className="text-sm text-[var(--mute)]">/{c.slug}</span></td>
                  <td><span className="mono text-[12px]">{c.filter}</span></td>
                  <td className="text-right">
                    <Link href={productsHref(c)} className="font-display font-bold hover:underline underline-offset-4">
                      {c.productCount}
                    </Link>
                  </td>
                  <td className="text-right text-sm">
                    {c.startingPrice > 0 ? fmt(c.startingPrice) : <span className="text-[var(--mute)]">—</span>}
                  </td>
                  <td className="text-center text-sm">{c.order}</td>
                  <td className="text-center">
                    <VisibleSwitch c={c} busy={togglingId === c.id} onToggle={() => onToggleActive(c)} />
                  </td>
                  <td><Actions c={c} onEdit={onEdit} onDelete={onDelete} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="md:hidden grid gap-3 mb-5">
        {rows.map((c) => (
          <article key={c.id} className="card p-4">
            <div className="flex gap-3.5">
              <CategoryCardPreview compact name={c.name} label={c.label} startingPrice={c.startingPrice} bgColor={c.bgColor} accentColor={c.accentColor} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <b className="leading-snug">{c.name}</b>
                  <VisibleSwitch c={c} busy={togglingId === c.id} onToggle={() => onToggleActive(c)} />
                </div>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  /{c.slug} · <span className="mono">{c.filter}</span>
                </p>
                <p className="text-xs mt-1.5">
                  <Link href={productsHref(c)} className="font-semibold underline underline-offset-2">
                    {c.productCount} product{c.productCount === 1 ? "" : "s"}
                  </Link>
                  {c.startingPrice > 0 && <span className="text-[var(--mute)]"> · from {fmt(c.startingPrice)}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3.5 pt-3.5 border-t border-[var(--line)]">
              <span className="text-xs text-[var(--mute)]">Order {c.order}{c.isFeatured ? " · ★ Featured" : ""}</span>
              <Actions c={c} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
