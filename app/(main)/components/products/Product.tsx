import Link from "next/link";
import ReusableImage from "@/app/(main)/components/hero/ReusableImage";
import type { ProductCardData } from "@/db/actions/product.action";
import { getCurrencySettings } from "@/db/settings.server";
import { formatPrice } from "@/db/settings";

export interface ProductProps {
  product: ProductCardData;
  /** Load the image eagerly (use for products visible on first paint) */
  priority?: boolean;
}

export default async function Product({ product, priority = false }: ProductProps) {
  const currency = await getCurrencySettings();
  const {
    name,
    slug,
    images,
    regularPrice,
    salePrice,
    discount,
    rating,
    reviewCount,
  } = product;

  const href = `/product/${slug}`;
  const hasDiscount = discount > 0;
  const showRegularPrice = regularPrice > salePrice;

  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-surface overflow-hidden transition duration-300 hover:shadow-xl hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-soft">
        <Link href={href} aria-label={name} className="absolute inset-0 block">
          {/* Zoom lives on this wrapper so it doesn't clash with the image's own fade-in transition */}
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

          {/* Subtle shade on hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </Link>

        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-full shadow-sm">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          aria-label={`Add ${name} to wishlist`}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-bg/80 backdrop-blur grid place-items-center shadow-sm transition hover:text-wine hover:scale-110"
        >
          ♥
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        {typeof rating === "number" && rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-mute mb-1">
            <span className="text-yellow-400" aria-hidden="true">
              ★
            </span>
            {rating.toFixed(1)}
            {typeof reviewCount === "number" &&
              reviewCount > 0 &&
              ` (${reviewCount.toLocaleString("en-US")})`}
          </div>
        )}

        <h3 className="font-semibold truncate mb-2" title={name}>
          <Link href={href} className="transition-colors hover:text-mute">
            {name}
          </Link>
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-2 mb-3">
          <b className="font-display text-lg">
            <span className="sr-only">Price: </span>
            {formatPrice(salePrice, currency)}
          </b>
          {showRegularPrice && (
            <s className="text-xs text-mute">
              <span className="sr-only">Regular price: </span>
              {formatPrice(regularPrice, currency)}
            </s>
          )}
        </div>

        <Link
          href={href}
          className="mt-auto w-full h-10 rounded-lg border border-line text-sm font-semibold grid place-items-center transition hover:bg-ink hover:text-bg hover:border-ink"
        >
          Shop Now
        </Link>
      </div>
    </article>
  );
}
