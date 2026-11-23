"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import { CONTENT_DEFAULTS, type SizeGuideContent } from "@/db/content";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props { data: Record<string, any> }

function Field({ label, value, onChange, multiline = false, rows = 2, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; rows?: number; hint?: string;
}) {
  return (
    <label className="field block">
      <span className="lbl">{label}</span>
      {multiline
        ? <textarea rows={rows} className="inp text-sm" style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
            value={value} onChange={(e) => onChange(e.target.value)} />
        : <input type="text" className="inp text-sm" value={value} onChange={(e) => onChange(e.target.value)} />}
      {hint && <p className="text-xs mt-1" style={{ color: "var(--mute)" }}>{hint}</p>}
    </label>
  );
}

function Sec({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest pt-2 pb-1 border-b"
      style={{ color: "var(--mute)", borderColor: "var(--line)" }}>{label}</p>
  );
}

type SGKey = keyof SizeGuideContent;

const TOGGLES: { key: SGKey; label: string }[] = [
  { key: "show_chart",   label: "সাইজ চার্ট" },
  { key: "show_measure", label: "মাপ নেওয়ার নিয়ম" },
  { key: "show_faq",     label: "সাধারণ প্রশ্ন (FAQ)" },
];

const SIZES = ["s","m","l","xl","xxl","xxxl"] as const;
const COLS  = ["chest","shoulder","length","sleeve"] as const;
const COL_LABELS: Record<typeof COLS[number], string> = {
  chest: "বুক", shoulder: "কাঁধ", length: "দৈর্ঘ্য", sleeve: "হাতা",
};
const CAT_PREFIXES = [
  { prefix: "ts", label: "টি-শার্ট" },
  { prefix: "po", label: "পোলো" },
  { prefix: "sh", label: "শার্ট" },
] as const;

function buildState(raw: Record<string, unknown>): SizeGuideContent {
  const def = CONTENT_DEFAULTS["size-guide"] as SizeGuideContent;
  const result = { ...def };
  for (const k of Object.keys(def) as SGKey[]) {
    if (raw[k] !== undefined) {
      if (typeof def[k] === "boolean") {
        (result as unknown as Record<string, unknown>)[k] = raw[k] === false ? false : raw[k] !== "false";
      } else {
        (result as unknown as Record<string, unknown>)[k] = raw[k];
      }
    }
  }
  return result;
}

export default function SizeGuideEditor({ data }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [d, setD] = useState<SizeGuideContent>(() => buildState(data));
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState<"header"|"chart"|"measure"|"faq">("header");

  function set(k: SGKey, v: string | boolean) {
    setD((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }
  function f(k: SGKey) { return { value: d[k] as string, onChange: (v: string) => set(k, v) }; }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent("size-guide", d as unknown as Record<string, string>);
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
      router.refresh();
    });
  }

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "header",  label: "হেডার" },
    { key: "chart",   label: "সাইজ চার্ট" },
    { key: "measure", label: "মাপ নেওয়া" },
    { key: "faq",     label: "FAQ" },
  ];

  return (
    <div className="card p-6 max-w-4xl">
      <div className="mb-5">
        <h2 className="font-display font-bold text-xl">সাইজ গাইড</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--mute)" }}>
          সাইজ চার্ট, মাপ ও FAQ আপডেট করুন।
        </p>
      </div>

      {/* visibility toggles */}
      <div className="rounded-2xl border p-4 mb-6 space-y-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--mute)" }}>
          সেকশন দেখানো / লুকানো
        </p>
        <div className="flex flex-wrap gap-2">
          {TOGGLES.map(({ key, label }) => {
            const on = d[key] as boolean;
            return (
              <button key={key} type="button" onClick={() => set(key, !on)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-colors"
                style={{ borderColor: on ? "var(--ink)" : "var(--line)", background: on ? "var(--ink)" : "transparent", color: on ? "var(--bg)" : "var(--mute)" }}>
                <span className="w-3.5 h-3.5 rounded-sm border grid place-items-center text-[10px] flex-shrink-0"
                  style={{ borderColor: on ? "var(--bg)" : "var(--line)", background: on ? "var(--bg)" : "transparent", color: "var(--ink)" }}>
                  {on ? "✓" : ""}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* section tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
            className={`h-9 px-4 rounded-xl text-sm font-medium border transition-colors ${activeTab === t.key
              ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
              : "border-[var(--line)] text-[var(--mute)] hover:border-[var(--ink)] hover:text-[var(--ink)]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* HEADER */}
        {activeTab === "header" && (
          <div className="space-y-4">
            <Sec label="হেডার" />
            <Field label="শিরোনাম" {...f("headerTitle")} />
            <Field label="সাবটাইটেল" multiline rows={3} {...f("headerSubtitle")} />
            <Field label="চার্টের নিচে নোট" hint="যেমন: * সমস্ত মাপ সেন্টিমিটারে…" {...f("chartNote")} />
          </div>
        )}

        {/* CHART */}
        {activeTab === "chart" && (
          <div className="space-y-6">
            {CAT_PREFIXES.map(({ prefix, label }) => (
              <div key={prefix}>
                <Sec label={label} />
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold rounded-tl-xl"
                          style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", color: "var(--mute)" }}>সাইজ</th>
                        {COLS.map((col) => (
                          <th key={col} className="text-left px-3 py-2 font-semibold"
                            style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", color: "var(--mute)" }}>
                            {COL_LABELS[col]} (সেমি)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZES.map((sz, ri) => (
                        <tr key={sz} style={{ background: ri % 2 === 0 ? "var(--bg)" : "var(--surface)" }}>
                          <td className="px-3 py-2 font-bold font-mono" style={{ color: "var(--ink)" }}>
                            {sz.toUpperCase()}
                          </td>
                          {COLS.map((col) => {
                            const k = `${prefix}_${sz}_${col}` as SGKey;
                            return (
                              <td key={col} className="px-2 py-1">
                                <input type="text" className="inp text-xs w-20 text-center"
                                  value={d[k] as string}
                                  onChange={(e) => set(k, e.target.value)} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MEASURE */}
        {activeTab === "measure" && (
          <div className="space-y-4">
            <Sec label="মাপ নেওয়ার নিয়ম" />
            <Field label="সেকশন শিরোনাম" {...f("measure_title")} />
            <Field label="সাবটাইটেল" multiline rows={2} {...f("measure_subtitle")} />
            <div className="grid sm:grid-cols-2 gap-4">
              {([1, 2, 3, 4] as const).map((n) => (
                <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
                  <Field label={`ধাপ ${n} — শিরোনাম`} {...f(`step${n}_title` as SGKey)} />
                  <Field label="বিবরণ" multiline rows={2} {...f(`step${n}_body` as SGKey)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            <Sec label="FAQ" />
            <Field label="সেকশন শিরোনাম" {...f("faq_title")} />
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
                <Field label={`#${n} প্রশ্ন`} {...f(`faq${n}_q` as SGKey)} />
                <Field label="উত্তর" multiline rows={3} {...f(`faq${n}_a` as SGKey)} />
              </div>
            ))}
          </div>
        )}

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ সংরক্ষিত হয়েছে</p>}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-40">
            {isPending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
