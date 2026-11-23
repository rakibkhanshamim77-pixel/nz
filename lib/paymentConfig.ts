import { getStoreSettings } from "@/db/settings.server";
import { WALLET_IDS, WALLET_META, type WalletId } from "@/db/settings";

export type PaymentMethodId = WalletId;

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  type: "Personal" | "Merchant";
  number: string;
  color: string;
  instructions: string[];
}

/** Per-wallet app name, used in the Bangla instructions. */
const APP_NAME: Record<WalletId, string> = {
  bkash: "bKash",
  nagad: "নগদ",
  rocket: "রকেট",
};

function instructionsFor(id: WalletId, number: string): string[] {
  const steps = [
    `আপনার ${APP_NAME[id]} অ্যাপ খুলুন`,
    id === "bkash"
      ? '"Send Money" সিলেক্ট করুন (Payment বা Cash Out নয়)'
      : '"Send Money" সিলেক্ট করুন',
    `নম্বরে পাঠান: ${number}`,
    "ঠিক পরিমাণ টাকা দিন — কম বা বেশি দিলে অর্ডার কনফার্ম হতে দেরি হবে",
  ];
  if (id === "bkash") steps.push("Reference-এ অর্ডার নম্বর লিখুন (ঐচ্ছিক)");
  steps.push("Transaction ID সংরক্ষণ করুন এবং নিচে দিন");
  return steps;
}

/**
 * The wallets customers can pay into, from the settings page.
 *
 * Settings fall back to the PAY_* env vars while they're unset, so an existing
 * deployment keeps working until the settings page is saved once.
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { payments } = await getStoreSettings();

  return WALLET_IDS.filter((id) => payments[id].enabled && payments[id].number).map((id) => {
    const w = payments[id];
    return {
      id,
      name: WALLET_META[id].name,
      type: w.type,
      number: w.number,
      color: WALLET_META[id].color,
      instructions: instructionsFor(id, w.number),
    };
  });
}

export async function getPaymentMethod(id: string): Promise<PaymentMethod | null> {
  return (await getPaymentMethods()).find((m) => m.id === id) ?? null;
}

export async function isPaymentConfigured(): Promise<boolean> {
  return (await getPaymentMethods()).length > 0;
}
