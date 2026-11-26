"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, NOT_ALLOWED } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Settings, { SETTINGS_KEY } from "@/db/models/Settings";
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY_SETTINGS,
  type CurrencySettings,
} from "@/db/settings";

export async function updateCurrency(
  code: string,
): Promise<{ ok: true; currency: CurrencySettings } | { ok: false; error: string }> {
  const me = await requirePermission("settings");
  if (!me) return { ok: false, error: NOT_ALLOWED };

  const preset = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  if (!preset) return { ok: false, error: "Unsupported currency code." };

  const currency: CurrencySettings = {
    code: preset.code,
    symbol: preset.symbol,
    symbolPosition: preset.symbolPosition,
    decimalPlaces: preset.decimalPlaces,
  };

  try {
    await dbConnect();
    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { currency }, $setOnInsert: { key: SETTINGS_KEY } },
      { upsert: true, new: true },
    );
    revalidatePath("/", "layout");
    return { ok: true, currency };
  } catch {
    return { ok: false, error: "Failed to save currency. Please try again." };
  }
}

export async function updateCurrencyCustom(
  currency: CurrencySettings,
): Promise<{ ok: true; currency: CurrencySettings } | { ok: false; error: string }> {
  const me = await requirePermission("settings");
  if (!me) return { ok: false, error: NOT_ALLOWED };

  if (!currency.code?.trim()) return { ok: false, error: "Currency code is required." };
  if (!currency.symbol?.trim()) return { ok: false, error: "Symbol is required." };
  if (currency.decimalPlaces < 0 || currency.decimalPlaces > 4)
    return { ok: false, error: "Decimal places must be between 0 and 4." };

  const safe: CurrencySettings = {
    code: currency.code.trim().toUpperCase().slice(0, 10),
    symbol: currency.symbol.trim().slice(0, 10),
    symbolPosition: currency.symbolPosition === "after" ? "after" : "before",
    decimalPlaces: Math.round(currency.decimalPlaces),
  };

  try {
    await dbConnect();
    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { currency: safe }, $setOnInsert: { key: SETTINGS_KEY } },
      { upsert: true, new: true },
    );
    revalidatePath("/", "layout");
    return { ok: true, currency: safe };
  } catch {
    return { ok: false, error: "Failed to save currency. Please try again." };
  }
}

