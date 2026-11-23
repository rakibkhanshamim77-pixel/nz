"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartProvider";
import { useToast } from "@/lib/ToastProvider";
import { writeBuyNow } from "@/lib/cart";
import ProductQuantity from "./ProductQuantity";
import { useProductSelection } from "./ProductSelectionProvider";

interface ProductActionsProps {
  productId: string;
  slug: string;
  name: string;
  image: string;
  sku: string;
}

export default function ProductActions({
  productId,
  slug,
  name,
  image,
  sku,
}: ProductActionsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const toast = useToast();
  const {
    isSoldOut,
    showPickError,
    validateSelection,
    selectedColor,
    selectedSize,
    quantity,
    salePrice,
  } = useProductSelection();

  function buildCartItem(qty: number) {
    return {
      productId,
      slug,
      name,
      image,
      sku,
      size: selectedSize?.label,
      color: selectedColor?.name,
      colorHex: selectedColor?.hex,
      quantity: qty,
      unitPrice: salePrice,
    };
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addItem(buildCartItem(quantity));
    toast.success(`${name} কার্টে যোগ হয়েছে!`);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    writeBuyNow(buildCartItem(quantity));
    router.push("/checkout?mode=buynow");
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <ProductQuantity />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="flex-1 min-w-[180px] h-[52px] rounded-2xl border-2 border-ink font-semibold hover:bg-ink hover:text-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
        >
          {isSoldOut ? "স্টক শেষ" : "কার্টে যোগ করুন"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isSoldOut}
        className="mt-3 w-full h-[52px] rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        এখনই কিনুন
      </button>

      {showPickError && (
        <p className="text-sm font-medium mt-3 text-red-600" role="alert">
          ⚠ আগে একটি সাইজ বাছাই করুন।
        </p>
      )}
    </>
  );
}
