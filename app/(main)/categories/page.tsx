export const revalidate = 60;

import type { Metadata } from "next";
import { getAllCategories } from "@/db/actions/categories.action";
import { getCurrencySettings } from "@/db/settings.server";
import CategoriesBreadcrumb from "./_components/CategoriesBreadcrumb";
import CategoriesHero from "./_components/CategoriesHero";
import CategoriesGrid from "./_components/CategoriesGrid";

export const metadata: Metadata = {
  title: "Shop by Category",
  description: "Browse all our collections and find exactly what you're looking for.",
};

export default async function CategoriesPage() {
  const [categories, currency] = await Promise.all([
    getAllCategories(),
    getCurrencySettings(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-28 lg:pb-16">
      <CategoriesBreadcrumb />
      <CategoriesHero count={categories.length} />
      <CategoriesGrid categories={categories} currency={currency} />
    </main>
  );
}
