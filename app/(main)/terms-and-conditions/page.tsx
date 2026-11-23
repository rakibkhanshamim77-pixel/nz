import type { Metadata } from "next";
import TermsBreadcrumb from "./_components/TermsBreadcrumb";
import TermsHeader from "./_components/TermsHeader";
import TermsSections from "./_components/TermsSections";
import TermsContact from "./_components/TermsContact";

export const metadata: Metadata = {
  title: "শর্তাবলি – Neeshanz",
  description: "Neeshanz-এর ব্যবহারের শর্তাবলি — অর্ডার, পেমেন্ট, ডেলিভারি ও রিটার্ন নীতি।",
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
