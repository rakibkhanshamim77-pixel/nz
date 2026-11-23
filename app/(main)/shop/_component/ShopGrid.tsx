import type { ShopProductCardData } from "@/db/actions/product.action";
import ShopProductCard from "./ShopProductCard";
import ShopEmptyState from "./ShopEmptyState";

interface Props {
  products: ShopProductCardData[];
}

export default function ShopGrid({ products }: Props) {
  if (products.length === 0) return <ShopEmptyState />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
      {products.map((product, i) => (
        <ShopProductCard key={product._id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
