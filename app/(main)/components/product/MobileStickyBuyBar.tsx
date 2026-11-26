"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartProvider";
import { useToast } from "@/lib/ToastProvider";
import { writeBuyNow } from "@/lib/cart";
import { useProductSelection } from "./ProductSelectionProvider";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface MobileStickyBuyBarProps {
  productId: string;
  slug: string;
  name: string;
  image: string;
  sku: string;
}

export default function MobileStickyBuyBar({
  productId,
  slug,
  name,
  image,
  sku,
}: MobileStickyBuyBarProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { fmt: formatPrice } = useCurrency();
  const toast = useToast();
  const {
    salePrice,
    selectedSize,
    selectedColor,
    sizes,
    quantity,
    isSoldOut,
    validateSelection,
  } = useProductSelection();

  const statusText = isSoldOut
    ? "Out of Stock"
    : selectedSize
      ? `Size ${selectedSize.label} · ${quantity.toLocaleString("en-US")} pcs`
      : sizes.length > 0
        ? "Select a size"
        : `${quantity.toLocaleString("en-US")} pcs`;

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addItem({
      productId,
      slug,
      name,
      image,
      sku,
      size: selectedSize?.label,
      color: selectedColor?.name,
      colorHex: selectedColor?.hex,
      quantity,
      unitPrice: salePrice,
    });
    toast.success(`${name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    writeBuyNow({
      productId,
      slug,
      name,
      image,
      sku,
      size: selectedSize?.label,
      color: selectedColor?.name,
      colorHex: selectedColor?.hex,
      quantity,
      unitPrice: salePrice,
    });
    router.push("/checkout?mode=buynow");
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--line)] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-[var(--mute)] truncate">
            {statusText}
          </p>
          <p className="font-display font-extrabold text-xl leading-none">
            {formatPrice(salePrice * quantity)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="h-[52px] px-4 rounded-2xl border-2 border-[var(--ink)] font-semibold disabled:opacity-50 text-sm"
        >
          Add to Cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isSoldOut}
          className="flex-1 h-[52px] rounded-2xl bg-[var(--ink)] text-[var(--bg)] font-semibold disabled:opacity-50"
        >
          {isSoldOut ? "Out of Stock" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
