export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/db/connect/dbConnect";
import Faq from "@/db/models/Faq";

export const metadata: Metadata = {
  title: "সাধারণ প্রশ্নোত্তর – Neeshanz",
  description: "Neeshanz সম্পর্কে সাধারণ প্রশ্নোত্তর — অর্ডার, ডেলিভারি, রিটার্ন ও আরও অনেক কিছু।",
  alternates: { canonical: "/faq" },
};

interface FaqDoc {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

async function getFaqs(): Promise<FaqDoc[]> {
  await dbConnect();
  const docs = await Faq.find({ isPublished: true }).sort({ order: 1, createdAt: 1 }).lean();
  return docs.map((d) => ({
    _id: String(d._id),
    question: d.question,
    answer: d.answer,
    category: (d.category as string) || "সাধারণ",
    order: d.order ?? 0,
  }));
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  // Group by category
  const grouped = faqs.reduce<Record<string, FaqDoc[]>>((acc, f) => {
    const cat = f.category || "সাধারণ";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-mute mb-6">
        <Link href="/" className="hover:text-ink transition-colors">হোম</Link>
        <svg className="w-3.5 h-3.5 text-line" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-ink font-medium">প্রশ্নোত্তর</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">
          Neeshanz
        </span>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight mb-3">
          সাধারণ প্রশ্নোত্তর
        </h1>
        <p className="text-mute text-sm leading-relaxed max-w-xl">
          আমাদের সম্পর্কে সচরাচর জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে পাবেন।
          সমাধান না পেলে <Link href="/contact" className="underline underline-offset-2 hover:text-ink">আমাদের সাথে যোগাযোগ করুন</Link>।
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-10 text-center">
          <p className="text-mute text-sm">এখনো কোনো প্রশ্নোত্তর যোগ করা হয়নি।</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {categories.map((cat) => (
            <div key={cat}>
              {categories.length > 1 && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display font-bold text-base text-ink">{cat}</span>
                  <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {grouped[cat].map((faq) => (
                  <FaqItem key={faq._id} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact CTA */}
      <div className="mt-12 bg-surface border border-line rounded-2xl p-6 text-center">
        <p className="font-semibold text-sm mb-1">আপনার প্রশ্নের উত্তর খুঁজে পাননি?</p>
        <p className="text-mute text-xs mb-4">আমাদের সাথে সরাসরি যোগাযোগ করুন — আমরা দ্রুত সাড়া দেব।</p>
        <Link href="/contact"
          className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-ink text-bg text-sm font-medium hover:opacity-90 transition-opacity">
          যোগাযোগ করুন
        </Link>
      </div>
    </main>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-line rounded-2xl overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-soft transition-colors">
        <span className="font-medium text-sm text-ink">{question}</span>
        <svg className="w-4 h-4 text-mute shrink-0 transition-transform duration-200 group-open:rotate-180"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="px-5 pb-4 border-t border-line bg-surface">
        <p className="pt-3 text-sm text-mute leading-relaxed">{answer}</p>
      </div>
    </details>
  );
}
