export const revalidate = 60;

import type { Metadata } from "next";
import { getContent } from "@/db/content.server";
import TermsBreadcrumb from "./_components/TermsBreadcrumb";
import TermsSections from "./_components/TermsSections";
import TermsContact from "./_components/TermsContact";

export const metadata: Metadata = {
  title: "Terms & Conditions – Neeshanz",
  description: "Neeshanz terms of service — covering orders, payments, delivery and return policy.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default async function TermsAndConditionsPage() {
  const c = await getContent("terms");
  const hasAdminContent = c.body && c.body.trim().length > 0;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      <TermsBreadcrumb />

      <div className="mb-10">
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">
          Neeshanz
        </span>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight mb-3">
          শর্তাবলি ও নীতিমালা
        </h1>
        <p className="text-mute text-sm leading-relaxed max-w-xl">
          Neeshanz-এর ওয়েবসাইট ব্যবহার বা কেনাকাটা করলে আপনি নিচের শর্তাবলি মেনে নিচ্ছেন বলে গণ্য হবে।
          অনুগ্রহ করে মনোযোগ দিয়ে পড়ুন।
        </p>
        <p className="mt-3 text-xs text-mute">সর্বশেষ আপডেট: নভেম্বর ২০২৬</p>
      </div>

      {hasAdminContent ? (
        <div className="desc-body mb-10" dangerouslySetInnerHTML={{ __html: c.body }} />
      ) : (
        <TermsSections />
      )}

      <TermsContact />
    </main>
  );
}
