export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/db/content.server";

export const metadata: Metadata = {
  title: "রিটার্ন পলিসি – Neeshanz",
  description: "Neeshanz রিটার্ন ও এক্সচেঞ্জ নীতি — পণ্য ফেরত দেওয়ার শর্ত ও প্রক্রিয়া।",
  alternates: { canonical: "/return-policy" },
};

const STATIC_SECTIONS = [
  {
    id: 1,
    title: "রিটার্নের যোগ্যতা",
    body: "পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন আবেদন করতে হবে। পণ্য অব্যবহৃত, অক্ষত ও মূল প্যাকেজিংসহ থাকতে হবে।",
    items: [
      "পণ্যে ত্রুটি বা উৎপাদন সমস্যা থাকলে",
      "ভুল পণ্য বা সাইজ পাঠানো হলে",
      "পণ্য ক্ষতিগ্রস্ত অবস্থায় পৌঁছালে",
    ],
  },
  {
    id: 2,
    title: "রিটার্ন গ্রহণযোগ্য নয় যখন",
    body: "নিচের ক্ষেত্রে রিটার্ন গ্রহণ করা হবে না:",
    items: [
      "পণ্য ব্যবহার করা হয়েছে বা ধোয়া হয়েছে",
      "সেল বা ডিসকাউন্টে কেনা পণ্য",
      "ট্যাগ বা মূল প্যাকেজিং সরানো হয়েছে",
      "৭ দিনের পর রিটার্ন আবেদন",
    ],
  },
  {
    id: 3,
    title: "রিটার্ন প্রক্রিয়া",
    body: "রিটার্ন করতে হলে নিচের ধাপগুলো অনুসরণ করুন:",
    items: [
      "আমাদের হোয়াটসঅ্যাপ বা ইমেইলে যোগাযোগ করুন",
      "অর্ডার নম্বর ও সমস্যার ছবি পাঠান",
      "আমরা নিশ্চিত করলে পণ্য পাঠিয়ে দিন",
      "পণ্য পাওয়ার ৩–৫ কার্যদিবসের মধ্যে এক্সচেঞ্জ বা রিফান্ড দেওয়া হবে",
    ],
  },
  {
    id: 4,
    title: "শিপিং চার্জ",
    body: "পণ্যে ত্রুটি বা আমাদের ভুলের কারণে রিটার্ন হলে শিপিং চার্জ আমরা বহন করব। অন্য কারণে রিটার্নের ক্ষেত্রে শিপিং চার্জ ক্রেতার।",
  },
  {
    id: 5,
    title: "রিফান্ড নীতি",
    body: "এক্সচেঞ্জ সম্ভব না হলে পেমেন্ট পদ্ধতি অনুযায়ী ৫–৭ কার্যদিবসের মধ্যে রিফান্ড দেওয়া হবে। ক্যাশ অন ডেলিভারির ক্ষেত্রে বিকাশ/নগদে রিফান্ড দেওয়া হবে।",
  },
];

export default async function ReturnPolicyPage() {
  const c = await getContent("return-policy");
  const hasAdminContent = c.body && c.body.trim().length > 0;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-mute mb-6">
        <Link href="/" className="hover:text-ink transition-colors">হোম</Link>
        <svg className="w-3.5 h-3.5 text-line" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-ink font-medium">রিটার্ন পলিসি</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">Neeshanz</span>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight mb-3">রিটার্ন ও এক্সচেঞ্জ পলিসি</h1>
        <p className="text-mute text-sm leading-relaxed max-w-xl">
          আপনার সন্তুষ্টি আমাদের প্রধান লক্ষ্য। পণ্যে কোনো সমস্যা হলে আমরা তা দ্রুত সমাধান করতে প্রতিশ্রুতিবদ্ধ।
        </p>
        <p className="mt-3 text-xs text-mute">সর্বশেষ আপডেট: নভেম্বর ২০২৬</p>
      </div>

      {hasAdminContent ? (
        <div className="desc-body mb-10" dangerouslySetInnerHTML={{ __html: c.body }} />
      ) : (
        <div className="flex flex-col gap-6 mb-10">
          {STATIC_SECTIONS.map((s) => (
            <section key={s.id} className="bg-surface border border-line rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-soft text-ink text-xs font-bold flex items-center justify-center shrink-0 border border-line">
                  {s.id}
                </span>
                <h2 className="font-display font-bold text-base text-ink">{s.title}</h2>
              </div>
              <div className="pl-9 flex flex-col gap-2">
                <p className="text-sm text-mute leading-relaxed">{s.body}</p>
                {s.items && (
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {s.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-mute">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-4 bg-surface border border-line rounded-2xl p-5 text-center">
        <p className="text-mute text-xs">
          রিটার্ন সংক্রান্ত যেকোনো প্রশ্নে{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:text-ink">আমাদের সাথে যোগাযোগ করুন</Link>।
        </p>
      </div>
    </main>
  );
}

