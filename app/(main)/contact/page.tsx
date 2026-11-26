import type { Metadata } from "next";
import dbConnect from "@/db/connect/dbConnect";
import Faq from "@/db/models/Faq";
import { getContactSettings } from "@/db/settings.server";
import ContactHero from "./_components/ContactHero";
import ContactInfo from "./_components/ContactInfo";
import ContactForm from "./_components/ContactForm";
import ContactFAQ from "./_components/ContactFAQ";
import ContactMap from "./_components/ContactMap";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getContactSettings();
  return {
    title: s.seoTitle || "Contact Us – Neeshanz",
    description: s.seoDescription || "Contact Neeshanz for support.",
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const [settings, faqDocs] = await Promise.all([
    getContactSettings(),
    (async () => {
      try {
        await dbConnect();
        return Faq.find({ isPublished: true }).sort({ order: 1 }).lean();
      } catch {
        return [];
      }
    })(),
  ]);

  const faqs = faqDocs.map((f) => ({
    _id: String(f._id),
    question: f.question,
    answer: f.answer,
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <ContactHero title={settings.heroTitle} description={settings.heroDescription} />

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-4">
        <div className="space-y-6">
          {settings.formEnabled && (
            <ContactForm successMessage={settings.successMessage} />
          )}
          {!settings.formEnabled && (
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-8 text-center text-[var(--mute)]">
              <p>The contact form is currently unavailable. Please reach out via phone or email.</p>
            </div>
          )}
        </div>
        <div>
          <ContactInfo settings={settings} />
        </div>
      </div>

      <ContactMap mapUrl={settings.mapUrl} />
      <ContactFAQ faqs={faqs} />
    </main>
  );
}
