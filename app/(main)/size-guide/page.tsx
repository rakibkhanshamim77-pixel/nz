export const revalidate = 60;

import type { Metadata } from "next";
import { getContent } from "@/db/content.server";
import SizeGuideBreadcrumb from "./_components/SizeGuideBreadcrumb";
import SizeGuideChartDynamic from "./_components/SizeGuideChartDynamic";
import HowToMeasureDynamic from "./_components/HowToMeasureDynamic";
import SizeGuideFAQDynamic from "./_components/SizeGuideFAQDynamic";

export const metadata: Metadata = {
  title: "Size Guide – Neeshanz",
  description: "Complete size chart and measurement guide for Neeshanz T-shirts, polos and shirts.",
  alternates: { canonical: "/size-guide" },
};

export default async function SizeGuidePage() {
  const c = await getContent("size-guide");

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      <SizeGuideBreadcrumb />

      {/* Header */}
      <div className="mb-10">
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">
          Neeshanz
        </span>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight mb-3">
          {c.headerTitle}
        </h1>
        <p className="text-mute text-sm max-w-xl leading-relaxed">
          {c.headerSubtitle}
        </p>
      </div>

      {c.show_chart && <SizeGuideChartDynamic c={c} />}
      {c.show_measure && <HowToMeasureDynamic c={c} />}
      {c.show_faq && <SizeGuideFAQDynamic c={c} />}
    </main>
  );
}
