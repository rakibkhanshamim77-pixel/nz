"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { useCurrency } from "@/app/context/CurrencyProvider";
import { deleteProduct, setProductFeatured } from "@/db/actions/admin/product.admin.action";
import { isOnSale, STATUS_LABEL, type ProductRow } from "./types";
import ProductViewDrawer from "./ProductViewDrawer";
import DeleteProductDialog from "./DeleteProductDialog";

interface Props {
  products: ProductRow[];
  lowStockThreshold: number;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const editHref = (p: Pick<ProductRow, "id">) => `/admin/products/edit/${p.id}`;

const STAR_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z" />
  </svg>
);

function ProductThumb({ image, name }: { image?: string; name: string }) {
  return (
    <span className="thumb flex-shrink-0">
      {image ? (
        <Image src={image} alt={name} width={52} height={60} className="w-full h-full object-contain" />
      ) : (
        <svg className="w-6 h-6 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <rect x={3} y={5} width={18} height={14} rx={2} />
          <circle cx={9} cy={10} r={1.5} />
          <path d="m21 16-5-5-8 8" />
        </svg>
      )}
    </span>
  );
}

export function StatusBadge({ status }: { status: ProductRow["status"] }) {
  return (
    <span className={`st ${status}`}>
      <i />
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function ProductsTable({ products, lowStockThreshold }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { fmt: bn } = useCurrency();
  const [, startTransition] = useTransition();
  const [featuredLoading, setFeaturedLoading] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function toggleFeatured(product: ProductRow) {
    setFeaturedLoading(product.id);
    try {
      const res = await setProductFeatured(product.id, !product.isFeatured);
      if (!res.ok) return toast.error(res.error);
      toast.success(product.isFeatured ? "Removed from featured" : "Marked as featured");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't update the product. Please try again.");
    } finally {
      setFeaturedLoading(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    try {
      const res = await deleteProduct(id);
      if (!res.ok) return toast.error(res.error);
      toast.success("Product deleted");
      setDeleteTarget(null);
      setViewProduct(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't delete the product. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <section className="card p-10 text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-[var(--soft)] grid place-items-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx={11} cy={11} r={7} />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
        <b className="font-display text-lg block">No products found</b>
        <p className="text-sm text-[var(--mute)] mt-1">Try a different search or clear your filters.</p>
        <Link href="/admin/products/create" className="btn-solid mt-5 inline-flex">
          Create a product
        </Link>
      </section>
    );
  }

  const RowActions = ({ product }: { product: ProductRow }) => (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        className="icon-btn tip-wrap"
        data-tip="View"
        aria-label={`View ${product.name}`}
        onClick={() => setViewProduct(product)}
      >
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx={12} cy={12} r={3} />
        </svg>
      </button>
      <Link href={editHref(product)} className="icon-btn tip-wrap" data-tip="Edit" aria-label={`Edit ${product.name}`}>
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M4 20h4L19 9l-4-4L4 16z" />
          <path d="m13 7 4 4" />
        </svg>
      </Link>
      <button
        type="button"
        className="icon-btn solid tip-wrap"
        data-tip="Delete"
        aria-label={`Delete ${product.name}`}
        onClick={() => setDeleteTarget(product)}
      >
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop table */}
      <section className="card hidden md:block overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="ptbl">
            <thead>
              <tr>
                <th className="w-[72px]">Image</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th className="text-right">Regular</th>
                <th className="text-right">Sale</th>
                <th className="text-right">Stock</th>
                <th>Status</th>
                <th className="text-center">Featured</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="row-in">
                  <td>
                    <ProductThumb image={p.image} name={p.name} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-left font-semibold hover:underline underline-offset-4 max-w-[240px] truncate block"
                      onClick={() => setViewProduct(p)}
                    >
                      {p.name}
                    </button>
                    <span className="text-xs text-[var(--mute)]">
                      {p.colors.length > 0 && `${p.colors.length} colour${p.colors.length > 1 ? "s" : ""}`}
                      {p.colors.length > 0 && p.sizes.length > 0 && " · "}
                      {p.sizes.length > 0 && `${p.sizes.length} size${p.sizes.length > 1 ? "s" : ""}`}
                    </span>
                  </td>
                  <td>
                    <span className="mono text-[13px] text-[var(--mute)]">{p.sku}</span>
                  </td>
                  <td>
                    <span className="text-sm">{p.category}</span>
                  </td>
                  <td className="text-right">
                    {isOnSale(p) ? (
                      <span className="text-[var(--mute)] line-through">{bn(p.regularPrice)}</span>
                    ) : (
                      <b className="font-display">{bn(p.regularPrice)}</b>
                    )}
                  </td>
                  <td className="text-right">
                    {isOnSale(p) ? (
                      <b className="font-display">{bn(p.salePrice)}</b>
                    ) : (
                      <span className="text-[var(--mute)]">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    <span className={`font-display font-bold ${p.stock === 0 ? "line-through text-[var(--mute)]" : ""}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="star-t"
                      aria-pressed={p.isFeatured ? "true" : "false"}
                      aria-label="Toggle featured"
                      disabled={featuredLoading === p.id}
                      onClick={() => toggleFeatured(p)}
                    >
                      {featuredLoading === p.id ? <span className="spin w-[18px] h-[18px]" /> : STAR_ICON}
                    </button>
                  </td>
                  <td className="text-sm text-[var(--mute)]">{fmtDate(p.createdAt)}</td>
                  <td>
                    <RowActions product={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile cards */}
      <section className="md:hidden grid gap-3 mb-5">
        {products.map((p) => (
          <article key={p.id} className="card p-4">
            <div className="flex gap-3.5">
              <span className="thumb !w-[72px] !h-[84px] flex-shrink-0">
                {p.image ? (
                  <Image src={p.image} alt={p.name} width={72} height={84} className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-7 h-7 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <rect x={3} y={5} width={18} height={14} rx={2} />
                    <circle cx={9} cy={10} r={1.5} />
                    <path d="m21 16-5-5-8 8" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <b className="leading-snug">{p.name}</b>
                  <button
                    type="button"
                    className="star-t -mt-1.5 -mr-1.5 shrink-0"
                    aria-pressed={p.isFeatured ? "true" : "false"}
                    aria-label="Toggle featured"
                    disabled={featuredLoading === p.id}
                    onClick={() => toggleFeatured(p)}
                  >
                    {featuredLoading === p.id ? <span className="spin w-[18px] h-[18px]" /> : STAR_ICON}
                  </button>
                </div>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  <span className="mono">{p.sku}</span> · {p.category} · {p.stock} in stock
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <b className="font-display text-lg">{bn(isOnSale(p) ? p.salePrice : p.regularPrice)}</b>
                  {isOnSale(p) && <span className="text-sm text-[var(--mute)] line-through">{bn(p.regularPrice)}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3.5 pt-3.5 border-t border-[var(--line)]">
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-[var(--mute)]">{fmtDate(p.createdAt)}</span>
              </div>
              <div className="flex gap-1.5">
                <button type="button" className="icon-btn" aria-label={`View ${p.name}`} onClick={() => setViewProduct(p)}>
                  <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                </button>
                <Link href={editHref(p)} className="icon-btn" aria-label={`Edit ${p.name}`}>
                  <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M4 20h4L19 9l-4-4L4 16z" />
                    <path d="m13 7 4 4" />
                  </svg>
                </Link>
                <button type="button" className="icon-btn solid" aria-label={`Delete ${p.name}`} onClick={() => setDeleteTarget(p)}>
                  <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <ProductViewDrawer product={viewProduct} lowStockThreshold={lowStockThreshold} onClose={() => setViewProduct(null)} />

      <DeleteProductDialog
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </>
  );
}
