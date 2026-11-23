import { cache } from "react";
import dbConnect from "./connect/dbConnect";
import Settings, { SETTINGS_KEY } from "./models/Settings";
import {
  DEFAULT_SETTINGS,
  WALLET_IDS,
  withDefaults,
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
