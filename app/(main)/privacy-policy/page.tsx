import type { Metadata } from "next";
import PrivacyBreadcrumb from "./_components/PrivacyBreadcrumb";
import PrivacyHeader from "./_components/PrivacyHeader";
import PrivacySections from "./_components/PrivacySections";
import PrivacyContact from "./_components/PrivacyContact";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি – Neeshanz",
  description: "Neeshanz-এর প্রাইভেসি পলিসি — আপনার তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখা হয়।",
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
