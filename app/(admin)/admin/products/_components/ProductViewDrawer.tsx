"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { isOnSale, STATUS_LABEL, type ProductRow } from "./types";

interface Props {
  product: ProductRow | null;
  lowStockThreshold: number;
  onClose: () => void;
}

const bn = (n: number) => "৳" + Math.round(n).toLocaleString("en-US");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ProductViewDrawer({ product, lowStockThreshold, onClose }: Props) {
  const open = !!product;

  useEffect(() => {
    document.body.classList.toggle("drawer-open", open);
    return () => document.body.classList.remove("drawer-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onSale = !!product && isOnSale(product);
  const discount = product && onSale ? Math.round((1 - product.salePrice / product.regularPrice) * 100) : 0;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 opacity-0 pointer-events-none transition-opacity"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="vdrawer fixed inset-y-0 right-0 z-[61] w-full sm:w-[440px] bg-[var(--bg)] border-l border-[var(--line)] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Product details"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="h-[72px] px-5 sm:px-6 flex items-center justify-between border-b border-[var(--line)] shrink-0">
          <p className="font-display font-bold text-lg">Product details</p>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[var(--line)] grid place-items-center hover:bg-[var(--soft)]"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {product && (
            <>
              {/* Image */}
              <div className="rounded-3xl bg-[var(--soft)] aspect-square grid place-items-center overflow-hidden mb-5">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg className="w-20 h-20 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
                    <rect x={3} y={5} width={18} height={14} rx={2} />
                    <circle cx={9} cy={10} r={1.5} />
                    <path d="m21 16-5-5-8 8" />
                  </svg>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`st ${product.status}`}>
                  <i />
                  {STATUS_LABEL[product.status]}
                </span>
                {product.isFeatured && (
                  <span className="badge solid">★ Featured</span>
                )}
                {product.stock === 0 && (
                  <span className="badge dash">Out of stock</span>
                )}
                {product.stock > 0 && product.stock <= lowStockThreshold && (
                  <span className="badge dash">Low stock</span>
                )}
              </div>

              {/* Name & meta */}
              <h2 className="font-display font-extrabold text-2xl tracking-tight leading-tight">
                {product.name}
              </h2>
              <p className="text-sm text-[var(--mute)] mt-1">
                <span className="mono text-[13px]">{product.sku}</span> · {product.category}
              </p>

              {/* Price */}
              <div className="flex items-end gap-3 mt-4">
                <b className="font-display font-extrabold text-3xl leading-none">
                  {bn(onSale ? product.salePrice : product.regularPrice)}
                </b>
                {onSale && (
                  <>
                    <span className="text-[var(--mute)] line-through text-lg">{bn(product.regularPrice)}</span>
                    <span className="badge">−{discount}%</span>
                  </>
                )}
              </div>

              {/* Details */}
              <dl className="mt-6 rounded-2xl border border-[var(--line)] divide-y divide-[var(--line)] text-sm">
                {product.colors.length > 0 && (
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-[var(--mute)]">Colours</dt>
                    <dd className="flex flex-wrap justify-end gap-1.5">
                      {product.colors.map((c) => (
                        <span key={c} className="h-7 px-2.5 rounded-full bg-[var(--soft)] inline-flex items-center text-xs font-semibold">
                          {c}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {product.sizes.length > 0 && (
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-[var(--mute)]">Sizes</dt>
                    <dd className="flex flex-wrap justify-end gap-1.5">
                      {product.sizes.map((s) => (
                        <span key={s} className="h-7 min-w-[34px] px-2 rounded-lg border border-[var(--line)] inline-grid place-items-center text-xs font-bold font-display">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-[var(--mute)]">Regular price</dt>
                  <dd className="font-semibold">{bn(product.regularPrice)}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-[var(--mute)]">Sale price</dt>
                  <dd className="font-semibold">{onSale ? bn(product.salePrice) : "—"}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-[var(--mute)]">Stock</dt>
                  <dd className="font-semibold">{product.stock} units</dd>
                </div>
                {product.status === "scheduled" && product.publishAt && (
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-[var(--mute)]">Goes live</dt>
                    <dd className="font-semibold">{fmtDate(product.publishAt)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-[var(--mute)]">Created</dt>
                  <dd className="font-semibold">{fmtDate(product.createdAt)}</dd>
                </div>
              </dl>
            </>
          )}
        </div>

        {/* Footer */}
        {product && (
          <div className="p-4 sm:p-5 border-t border-[var(--line)] flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
              Close
            </button>
            <Link href={`/admin/products/edit/${product.id}`} className="btn-solid flex-1 justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 20h4L19 9l-4-4L4 16z" />
                <path d="m13 7 4 4" />
              </svg>
              Edit product
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
