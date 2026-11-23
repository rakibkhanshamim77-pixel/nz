/**
 * Store settings: shape, defaults and the pure logic that depends on them.
 *
 * No mongoose and no next/headers here, so client components can import the
 * types and the pricing helpers. The database reader lives in db/settings.server.ts.
 */

export interface StoreSettings {
  name: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
}

export interface DeliverySettings {
  /** Flat charge for Dhaka district (districtId 1) */
  insideDhaka: number;
  /** Flat charge everywhere else */
  outsideDhaka: number;
  /** Off by default — turning it on changes what customers are charged */
  freeDeliveryEnabled: boolean;
  /** Subtotal at or above which delivery is free, when enabled */
  freeDeliveryThreshold: number;
}

export type WalletType = "Personal" | "Merchant";
export const WALLET_TYPES: readonly WalletType[] = ["Personal", "Merchant"] as const;

export interface PaymentWallet {
  enabled: boolean;
  number: string;
  type: WalletType;
}

export type WalletId = "bkash" | "nagad" | "rocket";

export const WALLET_IDS: readonly WalletId[] = ["bkash", "nagad", "rocket"] as const;

export const WALLET_META: Record<WalletId, { name: string; color: string }> = {
  bkash: { name: "bKash", color: "#E2136E" },
  nagad: { name: "Nagad", color: "#F7941D" },
  rocket: { name: "Rocket", color: "#8B3CA7" },
};

export type PaymentSettings = Record<WalletId, PaymentWallet>;

export interface InventorySettings {
  /** At or below this stock count a product counts as low stock */
  lowStockThreshold: number;
}

export interface StoreConfig {
  store: StoreSettings;
  delivery: DeliverySettings;
  payments: PaymentSettings;
  inventory: InventorySettings;
}

export const SETTINGS_LIMITS = {
  nameMax: 60,
  emailMax: 80,
  addressMax: 200,
  chargeMax: 5_000,
  thresholdMax: 1_000_000,
  lowStockMax: 1_000,
} as const;

/**
 * Defaults deliberately reproduce the behaviour the code had before settings
 * existed: ৳60 inside Dhaka, ৳120 outside, and free delivery OFF (the checkout
 * UI advertised a ৳1,500 threshold that was never actually applied).
 */
export const DEFAULT_SETTINGS: StoreConfig = {
  store: {
    name: "Neeshanz",
    supportEmail: "support@neeshanz.com",
    supportPhone: "",
    address: "",
  },
  delivery: {
    insideDhaka: 60,
    outsideDhaka: 120,
    freeDeliveryEnabled: false,
    freeDeliveryThreshold: 1500,
  },
  payments: {
    bkash: { enabled: false, number: "", type: "Personal" },
    nagad: { enabled: false, number: "", type: "Personal" },
    rocket: { enabled: false, number: "", type: "Personal" },
  },
  inventory: {
    lowStockThreshold: 5,
  },
};

/** Dhaka is districtId 1 in the BD location dataset. */
export const DHAKA_DISTRICT_ID = 1;

/**
 * The single source of truth for what delivery costs. Server and client both call
 * this so the price shown at checkout always matches the price the order is saved
 * with — `placeOrder` recomputes it and is the authority.
 */
export function deliveryChargeFor(
  districtId: number | null | undefined,
  subtotal: number,
  delivery: DeliverySettings,
): number {
  if (!districtId) return 0;
  if (delivery.freeDeliveryEnabled && subtotal >= delivery.freeDeliveryThreshold) return 0;
  return districtId === DHAKA_DISTRICT_ID ? delivery.insideDhaka : delivery.outsideDhaka;
}

/** How much more a customer must add to earn free delivery, or null when N/A. */
export function amountToFreeDelivery(
  subtotal: number,
  delivery: DeliverySettings,
): number | null {
  if (!delivery.freeDeliveryEnabled) return null;
  const left = delivery.freeDeliveryThreshold - subtotal;
  return left > 0 ? left : null;
}

/** Merges a possibly-partial stored document onto the defaults. */
export function withDefaults(raw: unknown): StoreConfig {
  const d = DEFAULT_SETTINGS;
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Record<string, unknown>;
  const grp = <T,>(key: string, fallback: T): Record<string, unknown> => {
    const v = o[key];
    return v && typeof v === "object" ? (v as Record<string, unknown>) : (fallback as never);
  };

  const store = grp("store", d.store);
  const delivery = grp("delivery", d.delivery);
  const payments = grp("payments", d.payments);
  const inventory = grp("inventory", d.inventory);

  const str = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
  const n = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
  const b = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);

  const wallet = (id: WalletId): PaymentWallet => {
    const w = payments[id];
    const wo = w && typeof w === "object" ? (w as Record<string, unknown>) : {};
    return {
      enabled: b(wo.enabled, d.payments[id].enabled),
      number: str(wo.number, d.payments[id].number),
      type: wo.type === "Merchant" ? "Merchant" : "Personal",
    };
  };

  return {
    store: {
      name: str(store.name, d.store.name),
      supportEmail: str(store.supportEmail, d.store.supportEmail),
      supportPhone: str(store.supportPhone, d.store.supportPhone),
      address: str(store.address, d.store.address),
    },
    delivery: {
      insideDhaka: n(delivery.insideDhaka, d.delivery.insideDhaka),
      outsideDhaka: n(delivery.outsideDhaka, d.delivery.outsideDhaka),
      freeDeliveryEnabled: b(delivery.freeDeliveryEnabled, d.delivery.freeDeliveryEnabled),
      freeDeliveryThreshold: n(delivery.freeDeliveryThreshold, d.delivery.freeDeliveryThreshold),
    },
    payments: { bkash: wallet("bkash"), nagad: wallet("nagad"), rocket: wallet("rocket") },
    inventory: {
      lowStockThreshold: n(inventory.lowStockThreshold, d.inventory.lowStockThreshold),
    },
  };
}
