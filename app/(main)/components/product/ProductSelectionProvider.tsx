"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ProductColor, ProductSize } from "./product.types";

interface ProductSelectionValue {
  colors: ProductColor[];
  sizes: ProductSize[];
  salePrice: number;

  colorIndex: number;
  selectedColor: ProductColor | null;
  selectColor: (index: number) => void;

  selectedSize: ProductSize | null;
  selectSize: (label: string) => void;

  quantity: number;
  setQuantity: (value: number) => void;
  maxQuantity: number;

  isSoldOut: boolean;
  /** True after the user tried to buy without choosing a size */
  showPickError: boolean;
  /** Returns true when the selection is complete; otherwise shows the error and scrolls to the sizes */
  validateSelection: () => boolean;
}

const ProductSelectionContext = createContext<ProductSelectionValue | null>(null);

export function useProductSelection(): ProductSelectionValue {
  const ctx = useContext(ProductSelectionContext);
  if (!ctx) throw new Error("useProductSelection must be used inside <ProductSelectionProvider>");
  return ctx;
}

interface ProductSelectionProviderProps {
  colors: ProductColor[];
  sizes: ProductSize[];
  stock: number;
  salePrice: number;
  children: ReactNode;
}

/**
 * One shared selection state (color, size, quantity) for the gallery, the selectors,
 * the main buttons and the mobile sticky bar — so they never disagree.
 */
export default function ProductSelectionProvider({ colors, sizes, stock, salePrice, children }: ProductSelectionProviderProps) {
  const [colorIndex, setColorIndex] = useState(0);
  const [sizeLabel, setSizeLabel] = useState<string | null>(
    sizes.find((s) => s.stock > 0)?.label ?? null
  );
  const [quantity, setQuantityState] = useState(1);
  const [showPickError, setShowPickError] = useState(false);

  const selectedColor = colors[colorIndex] ?? null;
  const selectedSize = sizes.find((s) => s.label === sizeLabel) ?? null;

  const hasSizes = sizes.length > 0;
  const isSoldOut = hasSizes ? sizes.every((s) => s.stock <= 0) : stock <= 0;

  const maxQuantity = Math.max(
    1,
    selectedSize ? selectedSize.stock : hasSizes ? Math.max(...sizes.map((s) => s.stock)) : stock
  );

  const clamp = useCallback((value: number, max: number) => Math.min(Math.max(1, Math.floor(value) || 1), max), []);

  const selectColor = useCallback((index: number) => setColorIndex(index), []);

  const selectSize = useCallback(
    (label: string) => {
      const size = sizes.find((s) => s.label === label);
      if (!size || size.stock <= 0) return;
      setSizeLabel(label);
      setShowPickError(false);
      setQuantityState((q) => clamp(q, Math.max(1, size.stock)));
    },
    [sizes, clamp]
  );

  const setQuantity = useCallback((value: number) => setQuantityState(clamp(value, maxQuantity)), [clamp, maxQuantity]);

  const validateSelection = useCallback(() => {
    if (hasSizes && !selectedSize) {
      setShowPickError(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }, [hasSizes, selectedSize]);

  const value = useMemo<ProductSelectionValue>(
    () => ({
      colors,
      sizes,
      salePrice,
      colorIndex,
      selectedColor,
      selectColor,
      selectedSize,
      selectSize,
      quantity,
      setQuantity,
      maxQuantity,
      isSoldOut,
      showPickError,
      validateSelection,
    }),
    [colors, sizes, salePrice, colorIndex, selectedColor, selectColor, selectedSize, selectSize, quantity, setQuantity, maxQuantity, isSoldOut, showPickError, validateSelection]
  );

  return <ProductSelectionContext.Provider value={value}>{children}</ProductSelectionContext.Provider>;
}
