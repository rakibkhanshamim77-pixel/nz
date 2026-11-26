import type { Metadata } from "next";
import { guardPage } from "@/app/utils/authz";
import { getLowStockThreshold } from "@/db/settings.server";
import AdminTopbar from "../../../_components/AdminTopbar";

import ProductForm from "../_components/form/ProductForm";
import ProductFormHeader from "../_components/form/ProductFormHeader";
import { loadCategoryOptions } from "../_lib/categoryOptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create Product – Neeshanz Admin" };

export default async function CreateProductPage() {
  const user = await guardPage("product_management");
  const categories = await loadCategoryOptions();
  const lowStockThreshold = await getLowStockThreshold();

  return (
    <div>
      <AdminTopbar
        title="Create Product"
        subtitle="Add a new product to your catalogue"
        backHref="/admin/products"
        userName={user?.name}
        userRole={user?.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Create" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 max-w-[1400px]">
    
        <ProductFormHeader
          crumb="Create"
          title="Create Product"
          subtitle="Fill in the details below. Fields marked * are required."
        />
        <ProductForm mode="create" categories={categories} lowStockThreshold={lowStockThreshold} />
      </main>
    </div>
  );
}
