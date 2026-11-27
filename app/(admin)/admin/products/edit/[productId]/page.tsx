import type { Metadata } from "next";
import Link from "next/link";
import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Product from "@/db/models/Product";
import { guardPage } from "@/app/utils/authz";
import { getLowStockThreshold } from "@/db/settings.server";
import { productStatusOf } from "@/db/utils/productVisibility";
import AdminTopbar from "../../../../_components/AdminTopbar";
import ProductForm from "../../_components/form/ProductForm";
import ProductFormHeader from "../../_components/form/ProductFormHeader";
import type { ProductFormInitial } from "../../_components/form/formTypes";
import { loadCategoryOptions } from "../../_lib/categoryOptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Product – Neeshanz Admin" };

const measure = (n: number | undefined) => (typeof n === "number" ? String(n) : "");

async function loadProduct(productId: string): Promise<ProductFormInitial | null> {
  if (!mongoose.isValidObjectId(productId)) return null;
  await dbConnect();
  const p = await Product.findById(productId).lean();
  if (!p) return null;
  const rawCI = p.colorImages as Record<string, string[]> | null | undefined;
  const colors = p.colors ?? [];
  const colorImages: Record<string, string[]> = {};
  if (rawCI && typeof rawCI === "object") {
    for (const c of colors) {
      const urls = rawCI[c];
      if (Array.isArray(urls) && urls.length) {
        colorImages[c] = urls.filter((u): u is string => typeof u === "string" && !!u);
      }
    }
  }

  return {
    id: String(p._id),
    slug: p.slug,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
    name: p.name,
    sku: p.sku,
    category: p.category,
    description: p.description ?? "",
    regularPrice: p.regularPrice,
    salePrice: p.salePrice,
    stock: p.stock ?? 0,
    images: (p.images ?? []).filter((u): u is string => typeof u === "string" && !!u),
    colors,
    colorImages,
    sizes: p.sizes ?? [],
    features: p.features ?? [],
    sizeChart: (p.sizeChart ?? []).map((r) => ({
      size: r.size,
      chest: measure(r.chest),
      length: measure(r.length),
      sleeve: measure(r.sleeve),
    })),
    isActive: p.isActive !== false,
    isFeatured: !!p.isFeatured,
    publishAt: p.publishAt ? new Date(p.publishAt).toISOString() : null,
  };
}

function ProductNotFound() {
  return (
    <section className="card p-10 sm:p-14 text-center max-w-xl mx-auto mt-6">
      <div className="w-14 h-14 rounded-2xl bg-[var(--soft)] grid place-items-center mx-auto mb-4">
        <svg className="w-6 h-6 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 4 3 7l2 5 3-1v9h8v-9l3 1 2-5-5-3c-.7 2-2 3-4 3S8.7 6 8 4Z" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-2xl">Product not found</h1>
      <p className="text-sm text-[var(--mute)] mt-2">
        This product doesn&apos;t exist or was deleted. Check the link, or pick a product from the list.
      </p>
      <Link href="/admin/products" className="btn-solid mt-6 inline-flex">
        Back to products
      </Link>
    </section>
  );
}

export default async function EditProductPage({ params }: { params: { productId: string } }) {
  const user = await guardPage("product_management");
  const product = await loadProduct(params.productId);
  const categories = product ? await loadCategoryOptions(product.category) : [];
  const lowStockThreshold = await getLowStockThreshold();
  const status = product ? productStatusOf(product.isActive, product.publishAt) : null;

  return (
    <div>
      <AdminTopbar
        title={product ? "Edit Product" : "Product not found"}
        subtitle={product?.name}
        backHref="/admin/products"
        userName={user?.name}
        userRole={user?.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Edit" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 max-w-[1400px]">
        {product ? (
          <>
            <ProductFormHeader
              crumb="Edit"
              title={product.name}
              subtitle={`SKU ${product.sku} · changes go live as soon as you save`}
              badge={
                <span className={`st ${status} align-middle !text-xs`}>
                  <i />
                  {status === "active" ? "Active" : status === "draft" ? "Draft" : "Scheduled"}
                </span>
              }
              action={
                status === "active" ? (
                  <Link href={`/product/${product.slug}`} target="_blank" rel="noopener" className="btn-ghost">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                    </svg>
                    View on store
                  </Link>
                ) : undefined
              }
            />
            <ProductForm
              mode="edit"
              initial={product}
              categories={categories}
              lowStockThreshold={lowStockThreshold}
            />
          </>
        ) : (
          <ProductNotFound />
        )}
      </main>
    </div>
  );
}
