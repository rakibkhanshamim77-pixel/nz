export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  quantity: number;
  unitPrice: number;
}

const CART_KEY = "neeshanz_cart";
const BUY_NOW_KEY = "neeshanz_buynow";

function safeRead<T>(key: string, storage: Storage): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: unknown, storage: Storage): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeRead<CartItem[]>(CART_KEY, localStorage) ?? [];
}

export function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  safeWrite(CART_KEY, items, localStorage);
}

export function readBuyNow(): CartItem | null {
  if (typeof window === "undefined") return null;
  return safeRead<CartItem>(BUY_NOW_KEY, sessionStorage);
}

export function writeBuyNow(item: CartItem): void {
  if (typeof window === "undefined") return;
  safeWrite(BUY_NOW_KEY, item, sessionStorage);
}

export function clearBuyNow(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BUY_NOW_KEY);
  } catch {}
}

export function cartItemKey(item: Pick<CartItem, "productId" | "size" | "color">): string {
  return `${item.productId}__${item.size ?? ""}__${item.color ?? ""}`;
}
