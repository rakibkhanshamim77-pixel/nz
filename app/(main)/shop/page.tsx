import { Suspense } from "react";
import type { Metadata } from "next";
import { getShopProducts } from "@/db/actions/product.action";
import { getCategories } from "@/db/actions/categories.action";
import ShopBreadcrumb from "./_component/ShopBreadcrumb";
import ShopFiltersShell from "./_component/ShopFiltersShell";
import ShopGrid from "./_component/ShopGrid";
import ShopGridSkeleton from "./_component/ShopGridSkeleton";
import ShopPaginationClient from "./_component/ShopPaginationClient";

export const metadata: Metadata = {
  title: "Shop – Neeshanz",
  description:
    "Shop premium T-shirts, polos & shirts at the best prices. Free delivery available across Bangladesh.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop – Neeshanz",
    description:
      "Shop premium T-shirts, polos & shirts at the best prices. Free delivery available across Bangladesh.",
    url: "/shop",
    type: "website",
  },
};

interface PageProps {
  searchParams: {
    q?: string;
    cat?: string;
    size?: string;
    color?: string;
    maxPrice?: string;
    inStock?: string;
    onSale?: string;
    sort?: string;
    page?: string;
  };
}

function splitParam(val: string | undefined): string[] {
  return (val ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default async function ShopPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const maxPrice = parseInt(searchParams.maxPrice ?? "0") || undefined;

  const [result, categories] = await Promise.all([
    getShopProducts({
      q: searchParams.q,
      categories: splitParam(searchParams.cat),
      sizes: splitParam(searchParams.size),
      colors: splitParam(searchParams.color),
      maxPrice,
      inStock: searchParams.inStock === "1",
      onSale: searchParams.onSale === "1",
      sort: searchParams.sort,
      page,
    }),
    getCategories(10),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      <ShopBreadcrumb />

      <ShopFiltersShell categories={categories} totalCount={result.totalCount}>
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<ShopGridSkeleton />}
        >
          <ShopGrid products={result.products} />
        </Suspense>

        <ShopPaginationClient totalPages={result.totalPages} />
      </ShopFiltersShell>
    </main>
  );
}
