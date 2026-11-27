"use client";

import { useState } from "react";
import type { SizeGuideContent } from "@/db/content";

type Category = "ts" | "po" | "sh";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "ts", label: "টি-শার্ট" },
  { key: "po", label: "পোলো" },
  { key: "sh", label: "শার্ট" },
];

const SIZES = ["s", "m", "l", "xl", "xxl", "xxxl"] as const;
const COLUMNS = [
  { key: "chest",  label: "বুক (সেমি)" },
  { key: "length", label: "দৈর্ঘ্য (সেমি)" },
  { key: "sleeve", label: "Sleeve (সেমি)" },
];

export default function SizeGuideChartDynamic({ c }: { c: SizeGuideContent }) {
  const [active, setActive] = useState<Category>("ts");

  return (
    <section className="mb-12">
      <h2 className="font-display font-bold text-xl mb-4">সাইজ চার্ট</h2>

      <div className="flex gap-2 mb-5 flex-wrap">
        {CATEGORIES.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setActive(key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              active === key ? "bg-ink text-bg" : "bg-soft text-mute hover:text-ink"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-soft border-b border-line">
              <th className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">সাইজ</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZES.map((sz, i) => (
              <tr key={sz} className={`border-b border-line last:border-0 transition-colors hover:bg-soft/60 ${i % 2 === 0 ? "bg-bg" : "bg-surface"}`}>
                <td className="px-5 py-3.5 font-bold text-ink font-mono">{sz.toUpperCase()}</td>
                {COLUMNS.map((col) => {
                  const k = `${active}_${sz}_${col.key}` as keyof SizeGuideContent;
                  return (
                    <td key={col.key} className="px-5 py-3.5 text-ink tabular-nums">
                      {c[k] as string}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-mute">{c.chartNote}</p>
    </section>
  );
}
