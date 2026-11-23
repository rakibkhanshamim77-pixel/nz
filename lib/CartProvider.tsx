"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  type CartItem,
  cartItemKey,
  readCart,
  writeCart,
} from "./cart";

interface CartState {
  items: CartItem[];
  hydrated: boolean;
}

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; key: string }
  | { type: "UPDATE_QTY"; key: string; quantity: number }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true };

    case "ADD": {
      const key = cartItemKey(action.item);
      const existing = state.items.find((i) => cartItemKey(i) === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            cartItemKey(i) === key
              ? { ...i, quantity: Math.min(i.quantity + action.item.quantity, 20) }
              : i,
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }

    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) => cartItemKey(i) !== action.key),
      };

    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            cartItemKey(i) === action.key
              ? { ...i, quantity: Math.max(1, action.quantity) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };

    case "CLEAR":
      return { ...state, items: [] };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (item: Pick<CartItem, "productId" | "size" | "color">) => void;
  updateQty: (
    item: Pick<CartItem, "productId" | "size" | "color">,
    quantity: number,
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    hydrated: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    dispatch({ type: "HYDRATE", items: readCart() });
  }, []);

  // Persist every change after hydration
  useEffect(() => {
    if (state.hydrated) writeCart(state.items);
  }, [state.items, state.hydrated]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD", item });
  }, []);

  const removeItem = useCallback(
    (item: Pick<CartItem, "productId" | "size" | "color">) => {
      dispatch({ type: "REMOVE", key: cartItemKey(item) });
    },
    [],
  );

  const updateQty = useCallback(
    (
      item: Pick<CartItem, "productId" | "size" | "color">,
      quantity: number,
    ) => {
      dispatch({ type: "UPDATE_QTY", key: cartItemKey(item), quantity });
    },
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const itemCount = useMemo(
    () => state.items.reduce((s, i) => s + i.quantity, 0),
    [state.items],
  );

  const subtotal = useMemo(
    () => state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [state.items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQty,
      clearCart,
    }),
    [state.items, state.hydrated, itemCount, subtotal, addItem, removeItem, updateQty, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
