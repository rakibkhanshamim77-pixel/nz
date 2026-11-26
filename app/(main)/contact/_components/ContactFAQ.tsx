"use client";

import { useState } from "react";

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
}

interface Props {
  faqs: FaqItem[];
}

export default function ContactFAQ({ faqs }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-[var(--ink)] mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-center text-[var(--mute)] mb-8">
        Find quick answers to common questions.
      </p>
      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq._id;
          return (
            <div
              key={faq._id}
              className="border border-[var(--line)] rounded-2xl bg-[var(--surface)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq._id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-sm sm:text-base text-[var(--ink)]">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-[var(--mute)] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-[var(--mute)] leading-relaxed border-t border-[var(--line)] pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
