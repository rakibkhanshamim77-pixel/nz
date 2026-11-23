// Pure SSG — static content, no DB calls, no revalidation needed
export const revalidate = false;

import type { Metadata } from "next";
import TermsBreadcrumb from "./_components/TermsBreadcrumb";
import TermsHeader from "./_components/TermsHeader";
import TermsSections from "./_components/TermsSections";
import TermsContact from "./_components/TermsContact";

export const metadata: Metadata = {
  title: "Terms & Conditions – Neeshanz",
  description: "Neeshanz terms of service — covering orders, payments, delivery and return policy.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      <TermsBreadcrumb />
      <TermsHeader />
      <TermsSections />
      <TermsContact />
    </main>
  );
}
