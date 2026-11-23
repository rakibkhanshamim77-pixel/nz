import Link from "next/link";

interface ProductBreadcrumbProps {
  productName: string;
  category?: { name: string; slug: string };
}

export default function ProductBreadcrumb({ productName, category }: ProductBreadcrumbProps) {
  return (
    <nav className="text-sm text-mute mb-5 sm:mb-7 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-ink">
        হোম
      </Link>
      <span aria-hidden="true">/</span>
      <Link href={category ? `/shop?category=${encodeURIComponent(category.slug)}` : "/shop"} className="hover:text-ink">
        {category?.name ?? "শপ"}
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-ink font-medium" aria-current="page">
        {productName}
      </span>
    </nav>
  );
}
