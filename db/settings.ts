/**
 * Store settings: shape, defaults and the pure logic that depends on them.
 *
 * No mongoose and no next/headers here, so client components can import the
 * types and the pricing helpers. The database reader lives in db/settings.server.ts.
 */

export interface StoreSettings {
  name: string;
  country: string;  // ISO 3166-1 alpha-2, e.g. "BD", "AU", "US"
  supportEmail: string;
  supportPhone: string;
  address: string;
}

export interface DeliverySettings {
  /** Flat charge for customers from the same country as the store */
  domestic: number;
  /** Flat charge for customers from any other country */
  international: number;
  /** Off by default — applies to domestic orders only */
  freeDeliveryEnabled: boolean;
  /** Subtotal at or above which domestic delivery is free, when enabled */
  freeDeliveryThreshold: number;
}

export interface InventorySettings {
  /** At or below this stock count a product counts as low stock */
  lowStockThreshold: number;
}

export interface ContactSettings {
  heroTitle: string;
  heroDescription: string;
  phone: string;
  whatsapp: string;
  supportEmail: string;
  address: string;
  businessHours: string;
  mapUrl: string;
  facebook: string;
  instagram: string;
  otherSocialLinks: string;
  formEnabled: boolean;
  successMessage: string;
  seoTitle: string;
  seoDescription: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export interface CurrencySettings {
  code: string;      // e.g. "USD"
  symbol: string;    // e.g. "$"
  symbolPosition: "before" | "after";
  decimalPlaces: number;
}

export interface BrandingSettings {
  shortName: string;   // e.g. "NZ"
  brandName: string;   // e.g. "NEESHANZ"
  tagline: string;     // e.g. "NEXT LEVEL TEES"
  primaryColor: string; // hex, overrides --wine CSS variable
}

export const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  shortName: "NZ",
  brandName: "NEESHANZ",
  tagline: "NEXT LEVEL TEES",
  primaryColor: "#9b2c4a",
};

export interface PerkItem {
  title: string;
  subtitle: string;
}

export const DEFAULT_PERKS: PerkItem[] = [
  { title: "Fast Delivery", subtitle: "Worldwide shipping" },
  { title: "Free Exchange", subtitle: "Within 7 days" },
  { title: "Easy Payment", subtitle: "Secure card payment" },
];

export const SUPPORTED_CURRENCIES: { code: string; symbol: string; name: string; symbolPosition: "before" | "after"; decimalPlaces: number }[] = [
  { code: "USD", symbol: "$",  name: "US Dollar",        symbolPosition: "before", decimalPlaces: 2 },
  { code: "EUR", symbol: "€",  name: "Euro",             symbolPosition: "before", decimalPlaces: 2 },
  { code: "GBP", symbol: "£",  name: "British Pound",    symbolPosition: "before", decimalPlaces: 2 },
  { code: "BDT", symbol: "৳",  name: "Bangladeshi Taka", symbolPosition: "before", decimalPlaces: 0 },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",     symbolPosition: "before", decimalPlaces: 2 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham",      symbolPosition: "after",  decimalPlaces: 2 },
  { code: "SAR", symbol: "﷼",  name: "Saudi Riyal",      symbolPosition: "after",  decimalPlaces: 2 },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar",  symbolPosition: "before", decimalPlaces: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", symbolPosition: "before", decimalPlaces: 2 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar",  symbolPosition: "before", decimalPlaces: 2 },
];

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  code: "BDT",
  symbol: "৳",
  symbolPosition: "before",
  decimalPlaces: 0,
};

/** Format a price number using the given currency settings. */
export function formatPrice(amount: number, currency: CurrencySettings = DEFAULT_CURRENCY_SETTINGS): string {
  const fixed = amount.toFixed(currency.decimalPlaces);
  const formatted = Number(fixed).toLocaleString("en-US", {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });
  return currency.symbolPosition === "before"
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`;
}

export const DEFAULT_MAINTENANCE_SETTINGS: MaintenanceSettings = {
  enabled: false,
  message:
    "আমরা সাইটটি আরও উন্নত করতে রক্ষণাবেক্ষণ কাজ করছি। শীঘ্রই আবার চালু হবে — ধন্যবাদ আপনার ধৈর্যের জন্য।",
};

export interface StoreConfig {
  store: StoreSettings;
  delivery: DeliverySettings;
  inventory: InventorySettings;
  perks?: PerkItem[];
  contact?: Partial<ContactSettings>;
  maintenance?: Partial<MaintenanceSettings>;
  currency?: Partial<CurrencySettings>;
  branding?: Partial<BrandingSettings>;
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
export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  heroTitle: "Get in Touch",
  heroDescription:
    "We're here to help. Have a question about your order, products, or anything else? We'd love to hear from you.",
  phone: "",
  whatsapp: "",
  supportEmail: "support@neeshanz.com",
  address: "",
  businessHours: "Saturday – Thursday, 10 AM – 8 PM",
  mapUrl: "",
  facebook: "",
  instagram: "",
  otherSocialLinks: "",
  formEnabled: true,
  successMessage:
    "Thank you for contacting us! We'll get back to you within 24 hours. Your reference ID is:",
  seoTitle: "Contact Us – Neeshanz",
  seoDescription:
    "Contact Neeshanz for any questions about orders, products, delivery, or returns. We're here to help.",
};

export const DEFAULT_SETTINGS: StoreConfig = {
  store: {
    name: "Neeshanz",
    country: "BD",
    supportEmail: "support@neeshanz.com",
    supportPhone: "",
    address: "",
  },
  delivery: {
    domestic: 60,
    international: 500,
    freeDeliveryEnabled: false,
    freeDeliveryThreshold: 1500,
  },
  inventory: {
    lowStockThreshold: 5,
  },
  contact: DEFAULT_CONTACT_SETTINGS,
};

/**
 * The single source of truth for what delivery costs.
 * Server and client both call this so the price shown at checkout always
 * matches the price the order is saved with.
 *
 * Rules:
 *   - No customer country selected → 0 (not yet chosen, don't show a charge)
 *   - Customer country = store country → domestic rate (free delivery may apply)
 *   - Any other country              → international rate (free delivery never applies)
 */
export function deliveryChargeFor(
  customerCountryCode: string | null | undefined,
  storeCountryCode: string,
  subtotal: number,
  delivery: DeliverySettings,
): number {
  if (!customerCountryCode) return 0;

  const isDomestic = customerCountryCode === storeCountryCode;

  if (!isDomestic) return delivery.international;

  // Domestic: free delivery may apply
  if (delivery.freeDeliveryEnabled && subtotal >= delivery.freeDeliveryThreshold) return 0;
  return delivery.domestic;
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
  const inventory = grp("inventory", d.inventory);

  const str = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
  const n = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
  const b = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);

  const rawPerks = Array.isArray(o.perks) ? o.perks : [];
  const perks: PerkItem[] = DEFAULT_PERKS.map((def, i) => {
    const p = rawPerks[i];
    if (!p || typeof p !== "object") return { ...def };
    const pm = p as Record<string, unknown>;
    return {
      title: typeof pm.title === "string" && pm.title ? pm.title : def.title,
      subtitle: typeof pm.subtitle === "string" ? pm.subtitle : def.subtitle,
    };
  });

  return {
    store: {
      name: str(store.name, d.store.name),
      country: str(store.country, d.store.country),
      supportEmail: str(store.supportEmail, d.store.supportEmail),
      supportPhone: str(store.supportPhone, d.store.supportPhone),
      address: str(store.address, d.store.address),
    },
    delivery: {
      domestic: n(delivery.domestic, d.delivery.domestic),
      international: n(delivery.international, d.delivery.international),
      freeDeliveryEnabled: b(delivery.freeDeliveryEnabled, d.delivery.freeDeliveryEnabled),
      freeDeliveryThreshold: n(delivery.freeDeliveryThreshold, d.delivery.freeDeliveryThreshold),
    },
    inventory: {
      lowStockThreshold: n(inventory.lowStockThreshold, d.inventory.lowStockThreshold),
    },
    perks,
  };
}
