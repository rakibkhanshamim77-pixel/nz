import ProductPrice from "./ProductPrice";
import { starParts } from "./product.utils";
import type { ProductDetails, ReviewSummaryData } from "./product.types";

interface ProductInfoProps {
  product: ProductDetails;
  reviewSummary: ReviewSummaryData;
}

export default function ProductInfo({ product, reviewSummary }: ProductInfoProps) {
  const { filled, empty } = starParts(reviewSummary.average);

  return (
    <>
      {product.eyebrow && (
        <p className="text-xs font-semibold tracking-[.22em] uppercase text-mute mb-2">{product.eyebrow}</p>
      )}
      <h1 className="font-display font-extrabold text-[2rem] sm:text-[2.6rem] tracking-tight leading-[1.05]">
        {product.name}
      </h1>

      {reviewSummary.total > 0 && (
        <a href="#reviews" className="inline-flex items-center gap-2 mt-3 text-sm hover:underline underline-offset-4">
          <span aria-hidden="true">
            <span className="text-yellow-400">{filled}</span>
            <span className="text-line">{empty}</span>
          </span>
          <b>{reviewSummary.average.toFixed(1)}</b>
          <span className="text-mute">({reviewSummary.total.toLocaleString("bn-BD")}টি রিভিউ)</span>
        </a>
      )}

      <ProductPrice regularPrice={product.regularPrice} salePrice={product.salePrice} />

      {product.descriptionHtml ? (
        <div
          className="desc-body mt-5"
          // Safe: description HTML is sanitised by sanitizeRichText before saving
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      ) : product.description ? (
        <p className="text-mute text-[15px] leading-relaxed mt-5">{product.description}</p>
      ) : null}
    </>
  );
}
