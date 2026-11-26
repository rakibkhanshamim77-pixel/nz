import type { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/db/connect/dbConnect";
import Category from "@/db/models/Category";
import Product from "@/db/models/Product";
import { guardPage } from "@/app/utils/authz";
import { publishedProductFilter } from "@/db/utils/productVisibility";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import ProductsPagination from "../products/_components/ProductsPagination";
import CategoriesManager from "./_components/CategoriesManager";
import type { CategoryRow } from "./_components/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories – Neeshanz Admin" };

interface SearchParams {
  q?: string;
  status?: string;
  page?: string;
  per?: string;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const q = searchParams.q?.trim().slice(0, 100) ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const per = [5, 10, 20, 50].includes(Number(searchParams.per)) ? Number(searchParams.per) : 20;

  const filter: Record<string, unknown> = {};
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: re }, { slug: re }, { label: re }, { filter: re }];
  }
  if (searchParams.status === "visible") filter.isActive = true;
  if (searchParams.status === "hidden") filter.isActive = false;

  const user = await guardPage("product_management");
  await dbConnect();

  const [total, matched, docs, all, counts, livePrices] = await Promise.all([
    Category.countDocuments({}),
    Category.countDocuments(filter),
    Category.find(filter).sort({ order: 1, name: 1 }).skip((page - 1) * per).limit(per).lean(),
    Category.find({}).sort({ order: 1, name: 1 }).select("name filter order").lean(),
    Product.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Product.aggregate<{ _id: string; min: number }>([
      { $match: publishedProductFilter() },
      { $group: { _id: "$category", min: { $min: "$salePrice" } } },
    ]),
  ]);

  const countBy = new Map(counts.map((c) => [c._id, c.count]));
  const minBy = new Map(livePrices.map((c) => [c._id, c.min]));

  const rows: CategoryRow[] = docs.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    label: c.label ?? "",
    filter: c.filter,
    description: c.description ?? "",
    startingPrice: c.startingPrice ?? 0,
    bgColor: c.bgColor ?? "#1f2937",
    accentColor: c.accentColor ?? "#cbd5e1",
    order: c.order ?? 0,
    isActive: c.isActive !== false,
    isFeatured: !!c.isFeatured,
    productCount: countBy.get(c.filter) ?? 0,
    lowestLivePrice: minBy.get(c.filter) ?? null,
  }));

  const managed = new Set(all.map((c) => c.filter));
  const unassigned = counts
    .filter((c) => c._id && !managed.has(c._id))
    .reduce((sum, c) => sum + c.count, 0);
  const nextOrder = all.reduce((max, c) => Math.max(max, c.order ?? 0), 0) + 1;

  return (
    <div>
      <AdminTopbar
        title="Categories"
        subtitle="Organise products and the shop filters"
        userName={user?.name}
        userRole={user?.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Categories" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Categories" },
          ]}
        />

        {unassigned > 0 && (
          <div className="card p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-3" role="status">
            <span className="badge dash shrink-0">Needs attention</span>
            <p className="text-sm text-[var(--mute)] flex-1">
              <b className="text-[var(--ink)]">{unassigned} product{unassigned > 1 ? "s use" : " uses"} a category that isn&apos;t managed here</b>
              , so {unassigned > 1 ? "they don't" : "it doesn't"} appear in any shop category filter. Edit the product and pick a category.
            </p>
            <Link href="/admin/products" className="btn-ghost !h-10 text-sm shrink-0">
              Review products
            </Link>
          </div>
        )}

        <CategoriesManager
          rows={rows}
          choices={all.map((c) => ({ filter: c.filter, name: c.name }))}
          total={total}
          matched={matched}
          nextOrder={nextOrder}
        />

        <ProductsPagination total={matched} page={page} per={per} />
      </main>
    </div>
  );
}
