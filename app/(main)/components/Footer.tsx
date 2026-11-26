import AccepterdPaymentMethods from "./AccepterdPaymentMethods";
import CopyrightMessage from "./CopyrightMessage";
import FooterBranding from "./FooterBranding";
import FooterCompany from "./FooterCompany";
import FooterContact from "./FooterContact";
import FooterHelp from "./FooterHelp";
import FooterShop from "./FooterShop";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <FooterBranding />
        <FooterShop />
        <FooterHelp />
        <FooterCompany />
        <FooterContact />
      </div>
      <AccepterdPaymentMethods />
      <CopyrightMessage />
    </footer>
  );
}
