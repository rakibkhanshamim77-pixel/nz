import type { Metadata } from "next";
import TrackHeader from "./_components/TrackHeader";
import TrackSearchForm from "./_components/TrackSearchForm";
import TrackHelp from "./_components/TrackHelp";

export const metadata: Metadata = {
  title: "অর্ডার ট্র্যাক – Neeshanz",
  description: "অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে আপনার Neeshanz অর্ডার ট্র্যাক করুন।",
};

export default function TrackOrderPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20">
      <TrackHeader />
      <TrackSearchForm />
      <TrackHelp />
    </main>
  );
}
