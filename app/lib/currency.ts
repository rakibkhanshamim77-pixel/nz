/**
 * Server-side price formatter. Reads the active currency from the database
 * once per request (React cache), so every component in a render shares one DB
 * call.
 *
 * Usage in a Server Component:
 *   import { getFormatter } from "@/app/lib/currency";
 *   const fmt = await getFormatter();
 *   fmt(1200)  // → "$1,200" or "৳1,200" etc.
 */

import { getCurrencySettings } from "@/db/settings.server";
import { formatPrice, type CurrencySettings } from "@/db/settings";

/** Returns a price-formatting function pre-loaded with the store's currency. */
export async function getFormatter(): Promise<(amount: number) => string> {
  const currency = await getCurrencySettings();
  return (amount: number) => formatPrice(amount, currency);
}

/** Directly format a price with the current store currency (one DB read per request). */
export async function fmt(amount: number): Promise<string> {
  const currency = await getCurrencySettings();
  return formatPrice(amount, currency);
}

/** Re-export so components can use the type without importing from db/settings. */
export type { CurrencySettings };
export { formatPrice };
