"use client";

import { useProductSelection } from "./ProductSelectionProvider";

export default function ProductQuantity() {
  const { quantity, setQuantity, maxQuantity, isSoldOut } = useProductSelection();

  return (
    <div className="qty" role="group" aria-label="পরিমাণ">
      <button type="button" aria-label="কমান" onClick={() => setQuantity(quantity - 1)} disabled={isSoldOut || quantity <= 1}>
        −
      </button>
      <span className="w-8 text-center font-semibold" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="বাড়ান"
        onClick={() => setQuantity(quantity + 1)}
        disabled={isSoldOut || quantity >= maxQuantity}
      >
        +
      </button>
    </div>
  );
}
