import Link from "next/link";
import ReusableImage from "@/app/(main)/components/hero/ReusableImage";
import type { ShopProductCardData } from "@/db/actions/product.action";
import { SHOP_SIZES } from "./shop.constants";

interface Props {
  product: ShopProductCardData;
  priority?: boolean;
}

export default function ShopProductCard({ product, priority = false }: Props) {
  const { name, slug, images, regularPrice, salePrice, discount, rating, reviewCount, sizes, stock } = product;
  const outOfStock = stock === 0 && sizes.length === 0;
  const href = `/product/${slug}`;

  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-surface overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">

      {/* image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-soft">
        <Link href={href} aria-label={name} className="absolute inset-0 block">
          <div className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <ReusableImage
              src={images[0]}
              fallbackSrc={images[1]}
              alt={name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, 50vw"
              className="object-cover"
              skeletonClassName="bg-soft"
            />
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </Link>

        {/* badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {outOfStock && (
            <span className="text-[11px] font-bold text-white bg-mute/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
              স্টক নেই
            </span>
          )}
          {!outOfStock && discount > 0 && (
            <span className="text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* wishlist */}
        <button
          type="button"
          aria-label={`${name} উইশলিস্টে যোগ করুন`}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-bg/80 backdrop-blur-sm border border-line grid place-items-center text-mute hover:text-wine hover:border-wine transition-all hover:scale-110"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* details */}
      <div className="flex flex-col flex-1 p-4">

        {/* rating */}
        {typeof rating === "number" && rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-mute mb-1.5">
            <span className="text-yellow-400" aria-hidden="true">★</span>
            {rating.toFixed(1)}
            {reviewCount ? ` (${reviewCount.toLocaleString()})` : ""}
          </div>
        )}

        {/* name */}
        <h3 className="font-semibold text-ink truncate mb-2" title={name}>
          <Link href={href} className="hover:text-mute transition-colors">{name}</Link>
        </h3>

        {/* size chips */}
        {SHOP_SIZES.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {SHOP_SIZES.map((s) => (
              <span
                key={s}
                className={[
                  "text-[10px] px-1.5 py-0.5 rounded border font-medium",
                  sizes.includes(s)
                    ? "border-line text-ink"
                    : "border-transparent text-mute/40 line-through",
                ].join(" ")}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* price */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          {regularPrice > salePrice && (
            <s className="text-xs text-mute">BDT {regularPrice.toLocaleString()}</s>
          )}
          <b className="font-display text-lg text-ink">BDT {salePrice.toLocaleString()}</b>
        </div>

        {/* CTA */}
        <Link
          href={href}
          className={[
            "w-full h-10 rounded-xl text-sm font-semibold grid place-items-center transition-all",
            outOfStock
              ? "border border-line text-mute pointer-events-none"
              : "border border-line text-ink hover:bg-ink hover:text-bg hover:border-ink",
          ].join(" ")}
          aria-disabled={outOfStock}
          tabIndex={outOfStock ? -1 : undefined}
        >
          {outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
        </Link>
      </div>
    </article>
  );
}
