// Pure SSG — static content, no DB calls, no revalidation needed
export const revalidate = false;

import type { Metadata } from "next";
import SizeGuideBreadcrumb from "./_components/SizeGuideBreadcrumb";
import SizeGuideHeader from "./_components/SizeGuideHeader";
import SizeGuideChart from "./_components/SizeGuideChart";
import HowToMeasure from "./_components/HowToMeasure";
import SizeGuideFAQ from "./_components/SizeGuideFAQ";

export const metadata: Metadata = {
  title: "Size Guide – Neeshanz",
  description: "Complete size chart and measurement guide for Neeshanz T-shirts, polos and shirts.",
  alternates: { canonical: "/size-guide" },
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
