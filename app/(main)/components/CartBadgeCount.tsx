"use client";

import { useCart } from "@/lib/CartProvider";

export default function CartBadgeCount() {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--wine)] text-white text-[10px] font-bold grid place-items-center pointer-events-none">
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  );
}
