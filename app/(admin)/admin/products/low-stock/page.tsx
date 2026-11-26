import type { Metadata } from "next";

import dbConnect from "@/db/connect/dbConnect";
import Product from "@/db/models/Product";
import { guardPage } from "@/app/utils/authz";
import { stockLevel } from "@/app/utils/inventory";
import { getLowStockThreshold } from "@/db/settings.server";
import {
  productStatusOf,
  publishedProductFilter,
} from "@/db/utils/productVisibility";
import AdminTopbar from "../../../_components/AdminTopbar";
import AdminBreadcrumb from "../../../_components/AdminBreadcrumb";
import ProductsPagination from "../_components/ProductsPagination";
import LowStockFilters from "./_components/LowStockFilters";
import LowStockStats from "./_components/LowStockStats";
import LowStockTable from "./_components/LowStockTable";
import type { LowStockRow } from "./_components/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Low Stock – Neeshanz Admin" };

interface SearchParams {
  q?: string;
  category?: string;
  status?: string;
  level?: string;
  threshold?: string;
  page?: string;
  per?: string;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function LowStockPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const defaultThreshold = await getLowStockThreshold();
  const t = Number(searchParams.threshold);
  const threshold =
    Number.isInteger(t) && t > 0 && t <= 1000 ? t : defaultThreshold;
  const criticalMax = Math.max(1, Math.ceil(threshold / 2));

  const q = searchParams.q?.trim().slice(0, 100) ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const per = [5, 10, 20, 50].includes(Number(searchParams.per))
    ? Number(searchParams.per)
    : 20;
  const now = new Date();

  const base = { stock: { $lte: threshold } };
  const levelRange: Record<string, Record<string, number>> = {
    out: { $lte: 0 },
    critical: { $gt: 0, $lte: criticalMax },
    low: { $gt: criticalMax, $lte: threshold },
  };

  const filter: Record<string, unknown> = { ...base };
  if (searchParams.level && levelRange[searchParams.level])
    filter.stock = levelRange[searchParams.level];
  if (searchParams.category) filter.category = searchParams.category;
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: re }, { sku: re }];
  }
  if (searchParams.status === "active")
    Object.assign(filter, publishedProductFilter(now));
  if (searchParams.status === "draft") filter.isActive = false;
  if (searchParams.status === "scheduled")
    Object.assign(filter, { isActive: true, publishAt: { $gt: now } });

  const user = await guardPage("product_management");
  await dbConnect();

  const [outCount, criticalCount, lowCount, matched, categories, docs] =
    await Promise.all([
      Product.countDocuments({ stock: levelRange.out }),
      Product.countDocuments({ stock: levelRange.critical }),
      Product.countDocuments({ stock: levelRange.low }),
      Product.countDocuments(filter),
      Product.distinct("category", base),
      Product.find(filter)
        .sort({ stock: 1, name: 1 })
        .skip((page - 1) * per)
        .limit(per)
        .select("name sku category images stock salePrice isActive publishAt")
        .lean(),
    ]);

  const rows: LowStockRow[] = docs.map((p) => {
    const level = stockLevel(p.stock ?? 0, threshold);
    return {
      id: String(p._id),
      name: p.name,
      sku: p.sku,
      category: p.category,
      image: p.images?.[0],
      stock: p.stock ?? 0,
      price: p.salePrice,
      status: productStatusOf(p.isActive, p.publishAt, now),
      level: level === "ok" ? "low" : level,
    };
  });

  const anyLow = outCount + criticalCount + lowCount > 0;

  return (
    <div>
      <AdminTopbar
        title="Low Stock"
        subtitle="Products that need restocking"
        userName={user?.name}
        userRole={user?.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Low Stock" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Products", href: "/admin/products" },
            { label: "Low Stock" },
          ]}
        />

        <LowStockStats
          out={outCount}
          critical={criticalCount}
          low={lowCount}
          threshold={threshold}
          criticalMax={criticalMax}
        />

        <LowStockFilters
          categories={(categories as string[]).filter(Boolean).sort()}
          threshold={threshold}
          defaultThreshold={defaultThreshold}
          matched={matched}
        />

        {rows.length > 0 ? (
          <>
            <LowStockTable rows={rows} threshold={threshold} />
            <ProductsPagination total={matched} page={page} per={per} />
          </>
        ) : (
          <section className="card p-10 sm:p-14 text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--ink)] text-[var(--bg)] grid place-items-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {anyLow ? (
                  <>
                    <circle cx={11} cy={11} r={7} />
                    <path d="m20 20-3.5-3.5" />
                  </>
                ) : (
                  <path d="m5 12 5 5L20 7" />
                )}
              </svg>
            </div>
            <b className="font-display text-lg block">
              {anyLow
                ? "No products match these filters"
                : "Everything is well stocked"}
            </b>
            <p className="text-sm text-[var(--mute)] mt-1">
              {anyLow
                ? "Try another search, level or category."
                : `No product has ${threshold} or fewer units left.`}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
