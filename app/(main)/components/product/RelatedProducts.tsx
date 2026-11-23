import Link from "next/link";
import ReusableImage from "@/app/(main)/components/hero/ReusableImage";
import type { ProductCardData } from "@/db/actions/product.action";
import { formatPrice } from "./product.utils";

interface RelatedProductsProps {
  products: ProductCardData[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-20" aria-labelledby="related-title">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2
          id="related-title"
          className="font-display font-bold text-2xl sm:text-3xl tracking-tight"
        >
          আরও পছন্দ হতে পারে
        </h2>
        <Link
          href="/shop"
          className="text-sm font-semibold underline underline-offset-4"
        >
          সব দেখুন
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.slice(0, 4).map((product) => (
          <Link
            key={product._id}
            href={`/product/${product.slug}`}
            className="group card p-3 sm:p-4 hover:border-[var(--ink)] transition-colors"
          >
            <div className="relative aspect-square rounded-2xl bg-soft overflow-hidden mb-3">
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none">
                <ReusableImage
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 260px, 50vw"
                  className="object-cover"
                  skeletonClassName="bg-soft"
                />
              </div>
              {product.discount > 0 && (
                <span className="absolute top-2 left-2 z-10 h-6 px-2 rounded-full bg-ink text-bg text-[11px] font-bold grid place-items-center">
                  −{product.discount}%
                </span>
              )}
            </div>
            <b className="block text-sm sm:text-base truncate">
              {product.name}
            </b>
            <span className="text-sm">
              <b>{formatPrice(product.salePrice)}</b>
              {product.regularPrice > product.salePrice && (
                <span className="text-mute line-through ml-1.5">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
