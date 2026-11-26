"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "সাইজ চার্ট কি পোশাকের মাপ নাকি শরীরের মাপ?",
    a: "উপরের চার্টটি পোশাকের (গার্মেন্ট) মাপ দেখাচ্ছে। নিজের শরীরের মাপ নিয়ে তার চেয়ে ৪–৬ সেমি বড় সাইজ বেছে নিন স্বাভাবিক ফিটের জন্য।",
  },
  {
    q: "দুটি সাইজের মাঝামাঝি থাকলে কোনটি নেব?",
    a: "স্লিম ফিট পছন্দ করলে ছোট সাইজ, আরামদায়ক ও রেগুলার ফিটের জন্য বড় সাইজটি নিন।",
  },
  {
    q: "ধোয়ার পর কি সাইজ পরিবর্তন হয়?",
    a: "আমাদের পোশাক প্রি-শ্রাংক ফেব্রিকে তৈরি। সঠিক তাপমাত্রায় ধুলে সংকোচন সর্বনিম্ন (প্রায় ১–২%) হয়।",
  },
  {
    q: "ভুল সাইজ অর্ডার করলে কি রিটার্ন করা যাবে?",
    a: "হ্যাঁ, পণ্য পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় রিটার্ন বা এক্সচেঞ্জ করা যাবে।",
  },
];

export default function SizeGuideFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mb-12">
      <h2 className="font-display font-bold text-xl mb-5">সাধারণ প্রশ্ন</h2>

      <div className="flex flex-col gap-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-line rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-soft transition-colors"
              aria-expanded={open === i}
            >
              <span className="font-medium text-sm text-ink">{faq.q}</span>
              <svg
                className={`w-4 h-4 text-mute shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {open === i && (
              <div className="px-5 pb-4 text-sm text-mute leading-relaxed border-t border-line bg-surface">
                <p className="pt-3">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
