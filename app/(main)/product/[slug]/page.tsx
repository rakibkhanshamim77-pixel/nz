// ISR: serve from cache, regenerate in background after 5 min.
// Admin product/review actions call revalidatePath("/", "layout") for instant invalidation.
export const revalidate = 300;
// New products created after build are rendered on first request, then cached.
export const dynamicParams = true;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import MobileStickyBuyBar from "@/app/(main)/components/product/MobileStickyBuyBar";
import ProductActions from "@/app/(main)/components/product/ProductActions";
import ProductBreadcrumb from "@/app/(main)/components/product/ProductBreadcrumb";
import ProductColorSelector from "@/app/(main)/components/product/ProductColorSelector";
import ProductDetailsAccordion from "@/app/(main)/components/product/ProductDetailsAccordion";
import ProductGallery from "@/app/(main)/components/product/ProductGallery";
import ProductInfo from "@/app/(main)/components/product/ProductInfo";
import ProductJsonLd from "@/app/(main)/components/product/ProductJsonLd";
import ProductPerks from "@/app/(main)/components/product/ProductPerks";
import ProductReviewSection from "@/app/(main)/components/product/ProductReviewSection";
import ProductSelectionProvider from "@/app/(main)/components/product/ProductSelectionProvider";
import ProductSizeSelector from "@/app/(main)/components/product/ProductSizeSelector";
import RelatedProducts from "@/app/(main)/components/product/RelatedProducts";
import {
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from "@/db/actions/getProductBySlugAction";
import dbConnect from "@/db/connect/dbConnect";
import Product from "@/db/models/Product";
import { publishedProductFilter } from "@/db/utils/productVisibility";

/** Pre-build all published product slugs so they ship as static HTML. */
export async function generateStaticParams() {
  try {
    await dbConnect();
    const products = await Product.find(publishedProductFilter())
      .select("slug")
      .lean<{ slug: string }[]>()
      .exec();
    return products.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

interface ProductPageProps {
  params: { slug: string };
}

// generateMetadata and the page both need the product — cache() makes it one DB query per request
const loadProduct = cache((slug: string) => getProductBySlug(slug));

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max - 1);
  return cut > 0 ? text.slice(0, cut) + "…" : text.slice(0, max) + "…";
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await loadProduct(params.slug);
  if (!product) return { title: "Product Not Found – Neeshanz", robots: { index: false } };

  const description = truncateAtWord(product.description, 155);
  const title = `${product.name} in Bangladesh | Neeshanz`;
  const canonicalUrl = `/product/${product.slug}`;
  const ogImage = product.images[0] ?? "/og-image.png";

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      images: [{ url: ogImage, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await loadProduct(params.slug);
  if (!product) notFound();

  // Reviews and related products don't depend on each other — fetch in parallel
  const [{ reviews, summary: reviewSummary }, related] = await Promise.all([
    getProductReviews(product._id, 6),
    getRelatedProducts(product._id, product.categoryId, 4),
  ]);

  return (
    <>
      <ProductJsonLd
        product={product}
        reviewSummary={reviewSummary}
        url={`/product/${product.slug}`}
      />

      <ProductSelectionProvider
        colors={product.colors}
        sizes={product.sizes}
        stock={product.stock}
        salePrice={product.salePrice}
      >
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-32 lg:pb-20">
          <ProductBreadcrumb
            productName={product.name}
            category={product.category}
          />

          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
            <ProductGallery
              name={product.name}
              images={product.images}
              discount={product.discount}
              isNew={product.isNew}
            />

            <section aria-label="পণ্যের তথ্য">
              <ProductInfo product={product} reviewSummary={reviewSummary} />

              <div className="h-px bg-[var(--line)] my-6" />

              <ProductColorSelector />
              <ProductSizeSelector
                hasSizeChart={Boolean(product.sizeChart?.rows.length)}
              />
              <ProductActions
                productId={product._id}
                slug={product.slug}
                name={product.name}
                image={product.images[0] ?? ""}
                sku={product._id}
              />
              <ProductPerks />
              <ProductDetailsAccordion product={product} />
            </section>
          </div>

          <ProductReviewSection
            reviews={reviews}
            summary={reviewSummary}
            sizeOptions={product.sizes.map((s) => s.label)}
            colorOptions={product.colors.map((c) => c.name)}
            productSlug={product.slug}
          />

          <RelatedProducts products={related} />
        </main>

        <MobileStickyBuyBar
          productId={product._id}
          slug={product.slug}
          name={product.name}
          image={product.images[0] ?? ""}
          sku={product._id}
        />
      </ProductSelectionProvider>
    </>
  );
}
