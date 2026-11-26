"use client";

import { useState } from "react";
import type { SizeGuideContent } from "@/db/content";

export default function SizeGuideFAQDynamic({ c }: { c: SizeGuideContent }) {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: c.faq1_q, a: c.faq1_a },
    { q: c.faq2_q, a: c.faq2_a },
    { q: c.faq3_q, a: c.faq3_a },
    { q: c.faq4_q, a: c.faq4_a },
  ].filter((f) => f.q);

  return (
    <section className="mb-12">
      <h2 className="font-display font-bold text-xl mb-5">{c.faq_title}</h2>

      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-line rounded-2xl overflow-hidden">
            <button type="button" onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-soft transition-colors"
              aria-expanded={open === i}>
              <span className="font-medium text-sm text-ink">{faq.q}</span>
              <svg className={`w-4 h-4 text-mute shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
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
