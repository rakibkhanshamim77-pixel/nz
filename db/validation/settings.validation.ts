import {
  SETTINGS_LIMITS,
  type PerkItem,
  type StoreConfig,
} from "../settings";

export type SettingsFieldKey =
  | "name"
  | "country"
  | "supportEmail"
  | "supportPhone"
  | "address"
  | "domestic"
  | "international"
  | "freeDeliveryThreshold"
  | "lowStockThreshold"
  | "perk0Title" | "perk0Sub"
  | "perk1Title" | "perk1Sub"
  | "perk2Title" | "perk2Sub";

export type SettingsFieldErrors = Partial<Record<SettingsFieldKey, string>>;

export type SettingsValidation =
  | { ok: true; data: StoreConfig }
  | { ok: false; errors: SettingsFieldErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Whole non-negative number from a number or digit string; NaN otherwise. */
function whole(v: unknown): number {
  if (typeof v === "number") return Number.isInteger(v) && v >= 0 ? v : NaN;
  const s = text(v);
  return /^\d{1,9}$/.test(s) ? Number(s) : NaN;
}

function normalizePhone(raw: unknown): string {
  let s = text(raw).replace(/[\s-]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("880")) s = "0" + s.slice(3);
  return s;
}

export function validateSettings(raw: unknown): SettingsValidation {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: SettingsFieldErrors = {};
  const L = SETTINGS_LIMITS;

  const group = (k: string): Record<string, unknown> => {
    const v = input[k];
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  };
  const store = group("store");
  const delivery = group("delivery");
  const inventory = group("inventory");

  /* ---- Store ---- */
  const name = text(store.name).replace(/\s+/g, " ");
  if (!name) errors.name = "Enter the store name";
  else if (name.length > L.nameMax) errors.name = `Keep the name under ${L.nameMax} characters`;

  const country = text(store.country).toUpperCase();
  if (!country) errors.country = "Select your store's country";
  else if (!/^[A-Z]{2}$/.test(country)) errors.country = "Invalid country code";

  const supportEmail = text(store.supportEmail).toLowerCase();
  if (supportEmail && !EMAIL.test(supportEmail)) errors.supportEmail = "Enter a valid email address";
  else if (supportEmail.length > L.emailMax) errors.supportEmail = "Email is too long";

  const supportPhone = normalizePhone(store.supportPhone);
  if (supportPhone && supportPhone.replace(/\D/g, "").length < 6)
    errors.supportPhone = "Enter a valid phone number";

  const address = text(store.address);
  if (address.length > L.addressMax) errors.address = `Keep the address under ${L.addressMax} characters`;

  /* ---- Delivery ---- */
  const domestic = whole(delivery.domestic);
  if (Number.isNaN(domestic)) errors.domestic = "Enter a whole number";
  else if (domestic > L.chargeMax) errors.domestic = `Charge can't exceed ${L.chargeMax}`;

  const international = whole(delivery.international);
  if (Number.isNaN(international)) errors.international = "Enter a whole number";
  else if (international > L.chargeMax) errors.international = `Charge can't exceed ${L.chargeMax}`;

  const freeDeliveryEnabled = delivery.freeDeliveryEnabled === true;
  const freeDeliveryThreshold = whole(delivery.freeDeliveryThreshold);
  if (Number.isNaN(freeDeliveryThreshold))
    errors.freeDeliveryThreshold = "Enter an amount in whole units";
  else if (freeDeliveryThreshold > L.thresholdMax)
    errors.freeDeliveryThreshold = "Amount is too high";
  else if (freeDeliveryEnabled && freeDeliveryThreshold === 0)
    errors.freeDeliveryThreshold = "Set the amount customers must reach, or turn free delivery off";

  /* ---- Inventory ---- */
  const lowStockThreshold = whole(inventory.lowStockThreshold);
  if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 1)
    errors.lowStockThreshold = "Enter a whole number of 1 or more";
  else if (lowStockThreshold > L.lowStockMax)
    errors.lowStockThreshold = `Threshold can't exceed ${L.lowStockMax}`;

  /* ---- Perks ---- */
  const rawPerks = Array.isArray(input.perks) ? input.perks : [];
  const perkKeys: ["perk0Title", "perk0Sub", "perk1Title", "perk1Sub", "perk2Title", "perk2Sub"] =
    ["perk0Title", "perk0Sub", "perk1Title", "perk1Sub", "perk2Title", "perk2Sub"];
  const perks: PerkItem[] = [0, 1, 2].map((i) => {
    const p = rawPerks[i];
    const pm = p && typeof p === "object" ? (p as Record<string, unknown>) : {};
    const title = text(pm.title);
    const subtitle = text(pm.subtitle);
    const tk = perkKeys[i * 2];
    const sk = perkKeys[i * 2 + 1];
    if (!title) errors[tk] = "Enter a title";
    else if (title.length > 40) errors[tk] = "Title must be 40 characters or less";
    if (subtitle.length > 60) errors[sk] = "Subtitle must be 60 characters or less";
    return { title, subtitle };
  });

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      store: { name, country, supportEmail, supportPhone, address },
      delivery: { domestic, international, freeDeliveryEnabled, freeDeliveryThreshold },
      inventory: { lowStockThreshold },
      perks,
    },
  };
}
