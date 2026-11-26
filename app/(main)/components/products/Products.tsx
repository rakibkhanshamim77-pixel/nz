import Link from "next/link";
import PageHeader from "../PageHeader";
import Product from "./Product";
import { getProducts } from "@/db/actions/product.action";

export default async function Products() {
  const products = await getProducts({ limit: 8 });

  return (
    <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
      <div className="flex items-end justify-between gap-4 mb-7">
        <PageHeader
          title="Products"
          description="Elevate your style with our latest collection"
        />

        <Link
          href="/shop"
          className="group inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-mute hover:text-ink transition-colors"
        >
          View all
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, index) => (
              <Product
                key={product._id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center h-12 px-8 rounded-xl bg-ink text-bg font-semibold hover:opacity-90"
            >
              View more
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-line py-16 px-6 text-center">
          <p className="font-semibold mb-1">No products available right now</p>
          <p className="text-sm text-mute">
            New collection coming soon — check back shortly.
          </p>
        </div>
      )}
    </section>
  );
}
