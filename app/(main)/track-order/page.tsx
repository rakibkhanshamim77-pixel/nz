import type { Metadata } from "next";
import TrackHeader from "./_components/TrackHeader";
import TrackSearchForm from "./_components/TrackSearchForm";
import TrackHelp from "./_components/TrackHelp";

export const metadata: Metadata = {
  title: "Track Order – Neeshanz",
  description: "Track your Neeshanz order using your order number and mobile number.",
  robots: { index: false, follow: false },
};

interface SearchParams {
  orderId?: string;
  phone?: string;
}

export default function TrackOrderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20">
      <TrackHeader />
      <TrackSearchForm
        initialPhone={searchParams.phone ?? ""}
        initialOrderId={searchParams.orderId ?? ""}
      />
      <TrackHelp />
    </main>
  );
}
