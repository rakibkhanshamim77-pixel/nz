import type { Metadata } from "next";
import SizeGuideBreadcrumb from "./_components/SizeGuideBreadcrumb";
import SizeGuideHeader from "./_components/SizeGuideHeader";
import SizeGuideChart from "./_components/SizeGuideChart";
import HowToMeasure from "./_components/HowToMeasure";
import SizeGuideFAQ from "./_components/SizeGuideFAQ";

export const metadata: Metadata = {
  title: "সাইজ গাইড – Neeshanz",
  description: "Neeshanz টি-শার্ট, পোলো ও শার্টের সম্পূর্ণ সাইজ চার্ট এবং মাপ নেওয়ার গাইড।",
};

export default function SizeGuidePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      <SizeGuideBreadcrumb />
      <SizeGuideHeader />
      <SizeGuideChart />
      <HowToMeasure />
      <SizeGuideFAQ />
    </main>
  );
}
