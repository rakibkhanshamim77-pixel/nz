import {
  SETTINGS_LIMITS,
  WALLET_IDS,
  type StoreConfig,
  type WalletId,
  type WalletType,
} from "../settings";

export type SettingsFieldKey =
  | "name"
  | "supportEmail"
  | "supportPhone"
  | "address"
  | "insideDhaka"
  | "outsideDhaka"
  | "freeDeliveryThreshold"
  | "lowStockThreshold"
  | `${WalletId}Number`;

export type SettingsFieldErrors = Partial<Record<SettingsFieldKey, string>>;

export type SettingsValidation =
  | { ok: true; data: StoreConfig }
  | { ok: false; errors: SettingsFieldErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BD_PHONE = /^01[3-9]\d{8}$/;

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
  const payments = group("payments");
  const inventory = group("inventory");

  /* ---- Store ---- */
  const name = text(store.name).replace(/\s+/g, " ");
  if (!name) errors.name = "Enter the store name";
  else if (name.length > L.nameMax) errors.name = `Keep the name under ${L.nameMax} characters`;

  const supportEmail = text(store.supportEmail).toLowerCase();
  if (supportEmail && !EMAIL.test(supportEmail)) errors.supportEmail = "Enter a valid email address";
  else if (supportEmail.length > L.emailMax) errors.supportEmail = "Email is too long";

  const supportPhone = normalizePhone(store.supportPhone);
  if (supportPhone && !BD_PHONE.test(supportPhone))
    errors.supportPhone = "Enter a valid Bangladeshi number, e.g. 01712345678";

  const address = text(store.address);
  if (address.length > L.addressMax) errors.address = `Keep the address under ${L.addressMax} characters`;

  /* ---- Delivery ---- */
  const insideDhaka = whole(delivery.insideDhaka);
  if (Number.isNaN(insideDhaka)) errors.insideDhaka = "Enter a charge in whole taka";
  else if (insideDhaka > L.chargeMax) errors.insideDhaka = `Charge can't exceed ${L.chargeMax}`;

  const outsideDhaka = whole(delivery.outsideDhaka);
  if (Number.isNaN(outsideDhaka)) errors.outsideDhaka = "Enter a charge in whole taka";
  else if (outsideDhaka > L.chargeMax) errors.outsideDhaka = `Charge can't exceed ${L.chargeMax}`;

  const freeDeliveryEnabled = delivery.freeDeliveryEnabled === true;
  const freeDeliveryThreshold = whole(delivery.freeDeliveryThreshold);
  if (Number.isNaN(freeDeliveryThreshold))
    errors.freeDeliveryThreshold = "Enter an amount in whole taka";
  else if (freeDeliveryThreshold > L.thresholdMax)
    errors.freeDeliveryThreshold = "Amount is too high";
  else if (freeDeliveryEnabled && freeDeliveryThreshold === 0)
    errors.freeDeliveryThreshold = "Set the amount customers must reach, or turn free delivery off";

  /* ---- Payments ---- */
  const wallets = {} as StoreConfig["payments"];
  for (const id of WALLET_IDS) {
    const w = payments[id];
    const wo = w && typeof w === "object" ? (w as Record<string, unknown>) : {};
    const number = normalizePhone(wo.number);
    const enabled = wo.enabled === true;
    const type: WalletType = wo.type === "Merchant" ? "Merchant" : "Personal";

    if (number && !BD_PHONE.test(number))
      errors[`${id}Number`] = "Enter a valid Bangladeshi number, e.g. 01712345678";
    else if (enabled && !number)
      errors[`${id}Number`] = "Add the number customers should send money to, or switch this off";

    wallets[id] = { enabled: enabled && !!number, number, type };
  }

  /* ---- Inventory ---- */
  const lowStockThreshold = whole(inventory.lowStockThreshold);
  if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 1)
    errors.lowStockThreshold = "Enter a whole number of 1 or more";
  else if (lowStockThreshold > L.lowStockMax)
    errors.lowStockThreshold = `Threshold can't exceed ${L.lowStockMax}`;

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      store: { name, supportEmail, supportPhone, address },
      delivery: { insideDhaka, outsideDhaka, freeDeliveryEnabled, freeDeliveryThreshold },
      payments: wallets,
      inventory: { lowStockThreshold },
    },
  };
}
