import { cache } from "react";
import dbConnect from "./connect/dbConnect";
import Settings, { SETTINGS_KEY } from "./models/Settings";
import {
  DEFAULT_BRANDING_SETTINGS,
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_CURRENCY_SETTINGS,
  DEFAULT_MAINTENANCE_SETTINGS,
  DEFAULT_SETTINGS,
  withDefaults,
  type BrandingSettings,
  type ContactSettings,
  type CurrencySettings,
  type MaintenanceSettings,
  type StoreConfig,
} from "./settings";

/**
 * The store's settings. Wrapped in React cache() so the many callers in one
 * render (sidebar, page, components) share a single read, while any new request
 * still picks up a change made on the settings page immediately.
 */
export const getStoreSettings = cache(async function getStoreSettings(): Promise<StoreConfig> {
  const envThreshold = Number(process.env.LOW_STOCK_THRESHOLD);
  const envInventory = Number.isInteger(envThreshold) && envThreshold > 0
    ? { lowStockThreshold: envThreshold }
    : undefined;

  try {
    await dbConnect();
    const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (!doc) return withDefaults({});

    const saved = withDefaults(doc);

    // Low-stock threshold: fall back to env if not stored
    const storedInv = (doc as { inventory?: { lowStockThreshold?: unknown } }).inventory;
    if (typeof storedInv?.lowStockThreshold !== "number" && envInventory)
      saved.inventory = envInventory;

    return saved;
  } catch {
    // Never take the storefront down over settings
    return { ...DEFAULT_SETTINGS };
  }
});

/** Convenience reader used by the admin stock screens. */
export async function getLowStockThreshold(): Promise<number> {
  return (await getStoreSettings()).inventory.lowStockThreshold;
}

/** Returns the maintenance mode status. NOT cached — always reads fresh from DB. */
export async function getMaintenanceStatus(): Promise<MaintenanceSettings> {
  try {
    await dbConnect();
    const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (!doc) return { ...DEFAULT_MAINTENANCE_SETTINGS };
    const raw = (doc as unknown as Record<string, unknown>).maintenance;
    if (!raw || typeof raw !== "object") return { ...DEFAULT_MAINTENANCE_SETTINGS };
    const m = raw as Record<string, unknown>;
    return {
      enabled: typeof m.enabled === "boolean" ? m.enabled : false,
      message: typeof m.message === "string" && m.message ? m.message : DEFAULT_MAINTENANCE_SETTINGS.message,
    };
  } catch {
    return { ...DEFAULT_MAINTENANCE_SETTINGS };
  }
}

/** Returns the currency settings merged with defaults. Always reads fresh — used by storefront price formatters. */
export const getCurrencySettings = cache(async function getCurrencySettings(): Promise<CurrencySettings> {
  try {
    await dbConnect();
    const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (!doc) return { ...DEFAULT_CURRENCY_SETTINGS };
    const raw = (doc as unknown as Record<string, unknown>).currency;
    if (!raw || typeof raw !== "object") return { ...DEFAULT_CURRENCY_SETTINGS };
    const c = raw as Record<string, unknown>;
    const d = DEFAULT_CURRENCY_SETTINGS;
    return {
      code: typeof c.code === "string" && c.code ? c.code : d.code,
      symbol: typeof c.symbol === "string" && c.symbol ? c.symbol : d.symbol,
      symbolPosition: c.symbolPosition === "after" ? "after" : "before",
      decimalPlaces: typeof c.decimalPlaces === "number" ? c.decimalPlaces : d.decimalPlaces,
    };
  } catch {
    return { ...DEFAULT_CURRENCY_SETTINGS };
  }
});

/** Returns the branding settings (logo text + primary colour) merged with defaults. */
export const getBrandingSettings = cache(async function getBrandingSettings(): Promise<BrandingSettings> {
  try {
    await dbConnect();
    const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (!doc) return { ...DEFAULT_BRANDING_SETTINGS };
    const raw = (doc as unknown as Record<string, unknown>).branding;
    if (!raw || typeof raw !== "object") return { ...DEFAULT_BRANDING_SETTINGS };
    const b = raw as Record<string, unknown>;
    const d = DEFAULT_BRANDING_SETTINGS;
    const str = (v: unknown, fb: string) => (typeof v === "string" && v ? v : fb);
    return {
      shortName: str(b.shortName, d.shortName),
      brandName: str(b.brandName, d.brandName),
      tagline: str(b.tagline, d.tagline),
      primaryColor: str(b.primaryColor, d.primaryColor),
    };
  } catch {
    return { ...DEFAULT_BRANDING_SETTINGS };
  }
});

/** Returns the contact page settings merged with defaults. */
export async function getContactSettings(): Promise<ContactSettings> {
  try {
    await dbConnect();
    const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (!doc) return { ...DEFAULT_CONTACT_SETTINGS };
    const raw = (doc as unknown as Record<string, unknown>).contact;
    if (!raw || typeof raw !== "object") return { ...DEFAULT_CONTACT_SETTINGS };
    const c = raw as Record<string, unknown>;
    const d = DEFAULT_CONTACT_SETTINGS;
    const str = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
    const bool = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);
    return {
      heroTitle: str(c.heroTitle, d.heroTitle),
      heroDescription: str(c.heroDescription, d.heroDescription),
      phone: str(c.phone, d.phone),
      whatsapp: str(c.whatsapp, d.whatsapp),
      supportEmail: str(c.supportEmail, d.supportEmail),
      address: str(c.address, d.address),
      businessHours: str(c.businessHours, d.businessHours),
      mapUrl: str(c.mapUrl, d.mapUrl),
      facebook: str(c.facebook, d.facebook),
      instagram: str(c.instagram, d.instagram),
      otherSocialLinks: str(c.otherSocialLinks, d.otherSocialLinks),
      formEnabled: bool(c.formEnabled, d.formEnabled),
      successMessage: str(c.successMessage, d.successMessage),
      seoTitle: str(c.seoTitle, d.seoTitle),
      seoDescription: str(c.seoDescription, d.seoDescription),
    };
  } catch {
    return { ...DEFAULT_CONTACT_SETTINGS };
  }
}
