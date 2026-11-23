// Pure SSG — static content, no DB calls, no revalidation needed
export const revalidate = false;

import type { Metadata } from "next";
import PrivacyBreadcrumb from "./_components/PrivacyBreadcrumb";
import PrivacyHeader from "./_components/PrivacyHeader";
import PrivacySections from "./_components/PrivacySections";
import PrivacyContact from "./_components/PrivacyContact";

export const metadata: Metadata = {
  title: "Privacy Policy – Neeshanz",
  description: "Read Neeshanz's privacy policy — how we collect, use and protect your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      <PrivacyBreadcrumb />
      <PrivacyHeader />
      <PrivacySections />
      <PrivacyContact />
    </main>
  );
}
