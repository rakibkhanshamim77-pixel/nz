import type { Metadata } from "next";
import CartClient from "./_component/CartClient";

export const metadata: Metadata = {
  title: "Cart – Neeshanz",
  robots: { index: false, follow: false },
};

export default function page() {
  return <CartClient />;
}
