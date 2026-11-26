export const revalidate = 60;

import type { Metadata } from "next";
import { getContent } from "@/db/content.server";
import PrivacyBreadcrumb from "./_components/PrivacyBreadcrumb";
import PrivacySections from "./_components/PrivacySections";
import PrivacyContact from "./_components/PrivacyContact";

export const metadata: Metadata = {
  title: "Privacy Policy – Neeshanz",
  description: "Read Neeshanz's privacy policy — how we collect, use and protect your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const c = await getContent("privacy");
  const hasAdminContent = c.body && c.body.trim().length > 0;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      <PrivacyBreadcrumb />

      <div className="mb-10">
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">
          Neeshanz
        </span>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight mb-3">
          প্রাইভেসি পলিসি
        </h1>
        <p className="text-mute text-sm leading-relaxed max-w-xl">
          Neeshanz-এ আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই নীতিতে আমরা
          ব্যাখ্যা করি কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখা হয়।
        </p>
        <p className="mt-3 text-xs text-mute">সর্বশেষ আপডেট: নভেম্বর ২০২৬</p>
      </div>

      {hasAdminContent ? (
        <div className="desc-body mb-10" dangerouslySetInnerHTML={{ __html: c.body }} />
      ) : (
        <PrivacySections />
      )}

      <PrivacyContact />
    </main>
  );
}
