import { cache } from "react";
import dbConnect from "./connect/dbConnect";
import Settings, { SETTINGS_KEY } from "./models/Settings";
import {
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_MAINTENANCE_SETTINGS,
  DEFAULT_SETTINGS,
  WALLET_IDS,
  withDefaults,
  type ContactSettings,
  type MaintenanceSettings,
  type StoreConfig,
  type WalletId,
  type WalletType,
} from "./settings";

/**
 * Settings the project previously read from env vars. These are used only where
 * the stored settings haven't been filled in, so an existing deployment keeps
 * working untouched until someone saves the settings page for the first time.
 */
function fromEnv(): Partial<StoreConfig> {
  const wallet = (id: WalletId) => {
    const number = process.env[`PAY_${id.toUpperCase()}_NUMBER`]?.trim() ?? "";
    const type = process.env[`PAY_${id.toUpperCase()}_TYPE`]?.trim();
    return {
      enabled: !!number,
      number,
      type: (type === "Merchant" ? "Merchant" : "Personal") as WalletType,
    };
  };

  const envThreshold = Number(process.env.LOW_STOCK_THRESHOLD);

  return {
    payments: {
      bkash: wallet("bkash"),
      nagad: wallet("nagad"),
      rocket: wallet("rocket"),
    },
    inventory: {
      lowStockThreshold:
        Number.isInteger(envThreshold) && envThreshold > 0
          ? envThreshold
          : DEFAULT_SETTINGS.inventory.lowStockThreshold,
    },
  };
}

/**
 * The store's settings. Wrapped in React cache() so the many callers in one
 * render (sidebar, page, components) share a single read, while any new request
 * still picks up a change made on the settings page immediately.
 *
 * Falls back to the env vars for payment wallets and the low-stock threshold
 * while those groups are still empty in the database.
 */
export const getStoreSettings = cache(async function getStoreSettings(): Promise<StoreConfig> {
  const env = fromEnv();

  try {
    await dbConnect();
    const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (!doc) return withDefaults(env);

    const saved = withDefaults(doc);

    // Nothing configured for a wallet yet -> use the env value
    const anyWalletSet = WALLET_IDS.some((id) => saved.payments[id].number);
    if (!anyWalletSet && env.payments) saved.payments = env.payments;

    // Threshold untouched -> use the env value
    const storedInv = (doc as { inventory?: { lowStockThreshold?: unknown } }).inventory;
    if (typeof storedInv?.lowStockThreshold !== "number" && env.inventory)
      saved.inventory = env.inventory;

    return saved;
  } catch {
    // Never take the storefront down over settings
    return withDefaults(env);
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
