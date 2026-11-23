import { getUser } from "@/app/utils/getUser";
import { getStoreSettings } from "@/db/settings.server";
import CheckoutClient from "./_component/CheckoutClient";

export const metadata = {
  title: "Checkout – Neeshanz",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [user, { delivery }] = await Promise.all([getUser(), getStoreSettings()]);

  const prefill = user
    ? {
        name: user.name ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
      }
    : null;

  return <CheckoutClient prefill={prefill} delivery={delivery} />;
}
