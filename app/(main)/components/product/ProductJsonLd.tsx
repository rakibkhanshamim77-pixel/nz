import type { ProductDetails, ReviewSummaryData } from "./product.types";

interface ProductJsonLdProps {
  product: ProductDetails;
  reviewSummary: ReviewSummaryData;
  url: string;
}

/** schema.org Product structured data for search engines */
export default function ProductJsonLd({ product, reviewSummary, url }: ProductJsonLdProps) {
  const inStock = product.sizes.length > 0 ? product.sizes.some((s) => s.stock > 0) : product.stock > 0;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://neeshanz.com";
  const toAbsolute = (u: string) => (u.startsWith("http") ? u : `${base}${u}`);
  const absoluteUrl = toAbsolute(url);

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map(toAbsolute),
    sku: product._id,
    brand: { "@type": "Brand", name: "Neeshanz" },
    ...(product.category ? { category: product.category.name } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl,
      priceCurrency: "BDT",
      price: product.salePrice,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(reviewSummary.total > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewSummary.average.toFixed(1),
            reviewCount: reviewSummary.total,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so product text can never close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
