import Link from "next/link";
import dbConnect from "@/db/connect/dbConnect";
import Product from "@/db/models/Product";
import { guardPage } from "@/app/utils/authz";
import { getLowStockThreshold } from "@/db/settings.server";
import { productStatusOf, publishedProductFilter } from "@/db/utils/productVisibility";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import ProductsStats from "./_components/ProductsStats";
import ProductsFilters from "./_components/ProductsFilters";
import ProductsTable from "./_components/ProductsTable";
import ProductsPagination from "./_components/ProductsPagination";
import type { ProductRow } from "./_components/types";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  category?: string;
  status?: string;
  pmin?: string;
  pmax?: string;
  sort?: string;
  page?: string;
  per?: string;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = searchParams.q?.trim().slice(0, 100) ?? "";
  const category = searchParams.category ?? "";
  const status = searchParams.status ?? "all";
  const pmin = searchParams.pmin ? Number(searchParams.pmin) : undefined;
  const pmax = searchParams.pmax ? Number(searchParams.pmax) : undefined;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const per = [5, 10, 20, 50].includes(parseInt(searchParams.per ?? "10", 10))
    ? parseInt(searchParams.per ?? "10", 10)
    : 10;

  const now = new Date();
  const scheduledFilter = { isActive: true, publishAt: { $gt: now } };

  const user = await guardPage("product_management");
  const lowStockThreshold = await getLowStockThreshold();
  await dbConnect();

  const filter: Record<string, unknown> = {};
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: re }, { sku: re }];
  }
  if (category) filter.category = category;
  if (status === "active") Object.assign(filter, publishedProductFilter(now));
  if (status === "draft") filter.isActive = false;
  if (status === "scheduled") Object.assign(filter, scheduledFilter);
  if ((pmin !== undefined && Number.isFinite(pmin)) || (pmax !== undefined && Number.isFinite(pmax))) {
    const priceFilter: Record<string, number> = {};
    if (pmin !== undefined && Number.isFinite(pmin)) priceFilter.$gte = pmin;
    if (pmax !== undefined && Number.isFinite(pmax)) priceFilter.$lte = pmax;
    filter.salePrice = priceFilter;
  }

  const [
    total,
    activeCount,
    draftCount,
    scheduledCount,
    featuredCount,
    filteredCount,
    categories,
    products,
  ] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments(publishedProductFilter(now)),
    Product.countDocuments({ isActive: false }),
    Product.countDocuments(scheduledFilter),
    Product.countDocuments({ isFeatured: true }),
    Product.countDocuments(filter),
    Product.distinct("category"),
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per)
      .limit(per)
      .select(
        "name slug sku category regularPrice salePrice stock colors sizes images isFeatured isActive publishAt createdAt",
      )
      .lean(),
  ]);

  const rows: ProductRow[] = products.map((p) => ({
    id: String(p._id),
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    category: p.category,
    regularPrice: p.regularPrice,
    salePrice: p.salePrice,
    stock: p.stock,
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    image: (p.images as string[])?.[0] ?? undefined,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    status: productStatusOf(p.isActive, p.publishAt, now),
    publishAt: p.publishAt ? new Date(p.publishAt).toISOString() : null,
    createdAt: p.createdAt ? new Date(p.createdAt as Date).toISOString() : "",
  }));

  return (
    <div>
      <AdminTopbar
        title="Products"
        subtitle="Manage your catalogue, prices and visibility"
        userName={user?.name}
        userRole={user?.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products" },
        ]}
        actions={
          <Link href="/admin/products/create" className="btn-solid !h-10 !px-3 sm:!px-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="hidden sm:inline">Add Product</span>
            <span className="sr-only sm:hidden">Add product</span>
          </Link>
        }
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Products" },
          ]}
        />

        <ProductsStats
          total={total}
          active={activeCount}
          draft={draftCount}
          scheduled={scheduledCount}
          featured={featuredCount}
        />

        <ProductsFilters
          categories={(categories as string[]).filter(Boolean)}
          total={total}
          filtered={filteredCount}
        />

        <ProductsTable products={rows} lowStockThreshold={lowStockThreshold} />

        <ProductsPagination total={filteredCount} page={page} per={per} />
      </main>
    </div>
  );
}
