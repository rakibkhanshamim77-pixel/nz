"use client";

import { useState } from "react";

type Category = "tshirt" | "polo" | "shirt";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "tshirt", label: "টি-শার্ট" },
  { key: "polo",   label: "পোলো" },
  { key: "shirt",  label: "শার্ট" },
];

interface SizeRow {
  size: string;
  chest: string;
  shoulder: string;
  length: string;
  sleeve: string;
}

const DATA: Record<Category, SizeRow[]> = {
  tshirt: [
    { size: "S",    chest: "৯৬",  shoulder: "৪২", length: "৬৮", sleeve: "২০" },
    { size: "M",    chest: "১০০", shoulder: "৪৪", length: "৭০", sleeve: "২১" },
    { size: "L",    chest: "১০৪", shoulder: "৪৬", length: "৭২", sleeve: "২২" },
    { size: "XL",   chest: "১০৮", shoulder: "৪৮", length: "৭৪", sleeve: "২৩" },
    { size: "XXL",  chest: "১১২", shoulder: "৫০", length: "৭৬", sleeve: "২৪" },
    { size: "XXXL", chest: "১১৬", shoulder: "৫২", length: "৭৮", sleeve: "২৫" },
  ],
  polo: [
    { size: "S",    chest: "৯৮",  shoulder: "৪৩", length: "৭০", sleeve: "২২" },
    { size: "M",    chest: "১০২", shoulder: "৪৫", length: "৭২", sleeve: "২৩" },
    { size: "L",    chest: "১০৬", shoulder: "৪৭", length: "৭৪", sleeve: "২৪" },
    { size: "XL",   chest: "১১০", shoulder: "৪৯", length: "৭৬", sleeve: "২৫" },
    { size: "XXL",  chest: "১১৪", shoulder: "৫১", length: "৭৮", sleeve: "২৬" },
    { size: "XXXL", chest: "১১৮", shoulder: "৫৩", length: "৮০", sleeve: "২৭" },
  ],
  shirt: [
    { size: "S",    chest: "১০০", shoulder: "৪৪", length: "৭২", sleeve: "৫৮" },
    { size: "M",    chest: "১০৪", shoulder: "৪৬", length: "৭৪", sleeve: "৬০" },
    { size: "L",    chest: "১০৮", shoulder: "৪৮", length: "৭৬", sleeve: "৬২" },
    { size: "XL",   chest: "১১২", shoulder: "৫০", length: "৭৮", sleeve: "৬৪" },
    { size: "XXL",  chest: "১১৬", shoulder: "৫২", length: "৮০", sleeve: "৬৬" },
    { size: "XXXL", chest: "১২০", shoulder: "৫৪", length: "৮২", sleeve: "৬৮" },
  ],
};

const COLUMNS = [
  { key: "chest",  label: "বুক (সেমি)" },
  { key: "length", label: "দৈর্ঘ্য (সেমি)" },
  { key: "sleeve", label: "Sleeve (সেমি)" },
];

export default function SizeGuideChart() {
  const [active, setActive] = useState<Category>("tshirt");
  const rows = DATA[active];

  return (
    <section className="mb-12">
      <h2 className="font-display font-bold text-xl mb-4">সাইজ চার্ট</h2>

      {/* Category tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              active === key
                ? "bg-ink text-bg"
                : "bg-soft text-mute hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
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
            {rows.map((row, i) => (
              <tr
                key={row.size}
                className={`border-b border-line last:border-0 transition-colors hover:bg-soft/60 ${
                  i % 2 === 0 ? "bg-bg" : "bg-surface"
                }`}
              >
                <td className="px-5 py-3.5 font-bold text-ink font-mono">{row.size}</td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-ink tabular-nums">
                    {row[col.key as keyof SizeRow]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-mute">
        * সমস্ত মাপ সেন্টিমিটারে এবং ±১–২ সেমি পার্থক্য থাকতে পারে।
      </p>
    </section>
  );
}
