"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { ContentSlug, AboutContent } from "@/db/content";
import { CONTENT_DEFAULTS } from "@/db/content";
import SizeGuideEditor from "./SizeGuideEditor";
import RichTextEditor from "./RichTextEditor";

const PAGE_OPTIONS = [
  { slug: "about" as ContentSlug, label: "আমাদের সম্পর্কে" },
  { slug: "size-guide" as ContentSlug, label: "সাইজ গাইড" },
  { slug: "terms" as ContentSlug, label: "শর্তাবলী" },
  { slug: "return-policy" as ContentSlug, label: "রিটার্ন পলিসি" },
  { slug: "privacy" as ContentSlug, label: "প্রাইভেসি পলিসি" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  pages: Record<string, Record<string, any>>;
}

function Field({
  label, hint, value, onChange, multiline = false, rows = 3,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; multiline?: boolean; rows?: number;
}) {
  return (
    <label className="field block">
      <span className="lbl">{label}</span>
      {multiline ? (
        <textarea rows={rows} className="inp text-sm"
          style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
          value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" className="inp text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="text-xs mt-1" style={{ color: "var(--mute)" }}>{hint}</p>}
    </label>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest pt-2 pb-1 border-b"
      style={{ color: "var(--mute)", borderColor: "var(--line)" }}>
      {label}
    </p>
  );
}

const SECTION_TOGGLES: { key: keyof AboutContent; label: string }[] = [
  { key: "show_stats",        label: "পরিসংখ্যান" },
  { key: "show_story",        label: "আমাদের গল্প" },
  { key: "show_milestones",   label: "যাত্রার ইতিহাস" },
  { key: "show_missionQuote", label: "মিশন উক্তি" },
  { key: "show_process",      label: "কাজের ধাপ" },
  { key: "show_values",       label: "মূল্যবোধ" },
  { key: "show_why",          label: "কেন আমরা?" },
  { key: "show_testimonials", label: "রিভিউ" },
  { key: "show_founder",      label: "প্রতিষ্ঠাতার কথা" },
  { key: "show_faq",          label: "FAQ" },
  { key: "show_community",    label: "কমিউনিটি" },
  { key: "show_closing",      label: "সমাপনী CTA" },
];

function AboutForm({ data, onChange }: { data: AboutContent; onChange: (k: keyof AboutContent, v: string | boolean) => void }) {
  const f = (k: keyof AboutContent) => ({ value: data[k] as string, onChange: (v: string) => onChange(k, v) });

  return (
    <div className="space-y-5">
      {/* Section visibility toggles */}
      <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--mute)" }}>
          সেকশন দেখানো / লুকানো
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTION_TOGGLES.map(({ key, label }) => {
            const on = data[key] as boolean;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key, !on)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors text-left"
                style={{
                  borderColor: on ? "var(--ink)" : "var(--line)",
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "var(--bg)" : "var(--mute)",
                }}
              >
                <span className="w-3.5 h-3.5 rounded-sm border flex-shrink-0 grid place-items-center text-[10px]"
                  style={{ borderColor: on ? "var(--bg)" : "var(--line)", background: on ? "var(--bg)" : "transparent", color: "var(--ink)" }}>
                  {on ? "✓" : ""}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs" style={{ color: "var(--mute)" }}>
          টগল করে সেকশন দেখানো বা লুকানো যাবে। সংরক্ষণ করলে সাথে সাথে সাইটে প্রযোজ্য হবে।
        </p>
      </div>

      <SectionHeader label="Hero সেকশন" />
      <Field label="ট্যাগলাইন" hint="প্রধান শিরোনাম" {...f("heroTagline")} />
      <Field label="সাবটাইটেল" multiline rows={2} {...f("heroSubtitle")} />

      <SectionHeader label="পরিসংখ্যান (৩টি)" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {([1, 2, 3] as const).map((n) => (
          <div key={n} className="space-y-2 p-3 rounded-xl border" style={{ borderColor: "var(--line)" }}>
            <Field label={`#${n} সংখ্যা`} {...f(`stat${n}Value` as keyof AboutContent)} />
            <Field label="লেবেল" {...f(`stat${n}Label` as keyof AboutContent)} />
          </div>
        ))}
      </div>

      <SectionHeader label="আমাদের গল্প" />
      <Field label="শিরোনাম" {...f("storyTitle")} />
      <Field label="বিবরণ" multiline rows={6} hint="প্যারাগ্রাফ আলাদা করতে নতুন লাইন ব্যবহার করুন" {...f("storyBody")} />

      <SectionHeader label="মিশন উক্তি" />
      <Field label="উক্তি" multiline rows={3} {...f("missionQuote")} />
      <Field label="লেখক" {...f("missionAuthor")} />

      <SectionHeader label="আমরা কীভাবে কাজ করি (৪ ধাপ)" />
      <Field label="সেকশন শিরোনাম" {...f("processTitle")} />
      <div className="grid sm:grid-cols-2 gap-3">
        {([1, 2, 3, 4] as const).map((n) => (
          <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
            <div className="flex gap-3">
              <div className="w-24 flex-shrink-0">
                <Field label={`#${n} আইকন`} hint="ইমোজি" {...f(`process${n}Icon` as keyof AboutContent)} />
              </div>
              <div className="flex-1">
                <Field label="শিরোনাম" {...f(`process${n}Title` as keyof AboutContent)} />
              </div>
            </div>
            <Field label="বিবরণ" multiline rows={2} {...f(`process${n}Body` as keyof AboutContent)} />
          </div>
        ))}
      </div>

      <SectionHeader label="আমাদের মূল্যবোধ (৩টি)" />
      {([1, 2, 3] as const).map((n) => (
        <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
          <div className="flex gap-3">
            <div className="w-24 flex-shrink-0">
              <Field label={`#${n} আইকন`} hint="ইমোজি / সিম্বল" {...f(`value${n}Icon` as keyof AboutContent)} />
            </div>
            <div className="flex-1">
              <Field label="শিরোনাম" {...f(`value${n}Title` as keyof AboutContent)} />
            </div>
          </div>
          <Field label="বিবরণ" multiline rows={2} {...f(`value${n}Body` as keyof AboutContent)} />
        </div>
      ))}

      <SectionHeader label="কেন Neeshanz বেছে নেবেন (৪টি)" />
      <Field label="সেকশন শিরোনাম" {...f("whyTitle")} />
      <div className="grid sm:grid-cols-2 gap-3">
        {([1, 2, 3, 4] as const).map((n) => (
          <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
            <div className="flex gap-3">
              <div className="w-24 flex-shrink-0">
                <Field label={`#${n} আইকন`} hint="ইমোজি" {...f(`why${n}Icon` as keyof AboutContent)} />
              </div>
              <div className="flex-1">
                <Field label="শিরোনাম" {...f(`why${n}Title` as keyof AboutContent)} />
              </div>
            </div>
            <Field label="বিবরণ" multiline rows={2} {...f(`why${n}Body` as keyof AboutContent)} />
          </div>
        ))}
      </div>

      <SectionHeader label="প্রতিষ্ঠাতার কথা" />
      <Field label="সেকশন শিরোনাম" {...f("founderTitle")} />
      <Field label="নাম" {...f("founderName")} />
      <Field label="পদবী" {...f("founderRole")} />
      <Field label="বার্তা" multiline rows={4} {...f("founderNote")} />

      <SectionHeader label="যাত্রার ইতিহাস / মাইলস্টোন (৪টি)" />
      <Field label="সেকশন শিরোনাম" {...f("milestonesTitle")} />
      {([1, 2, 3, 4] as const).map((n) => (
        <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
          <div className="flex gap-3">
            <div className="w-28 flex-shrink-0">
              <Field label={`#${n} সাল`} {...f(`milestone${n}Year` as keyof AboutContent)} />
            </div>
            <div className="flex-1">
              <Field label="শিরোনাম" {...f(`milestone${n}Title` as keyof AboutContent)} />
            </div>
          </div>
          <Field label="বিবরণ" multiline rows={2} {...f(`milestone${n}Body` as keyof AboutContent)} />
        </div>
      ))}

      <SectionHeader label="কাস্টমার রিভিউ (৩টি)" />
      <Field label="সেকশন শিরোনাম" {...f("testimonialsTitle")} />
      {([1, 2, 3] as const).map((n) => (
        <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
          <div className="grid grid-cols-3 gap-2">
            <Field label={`#${n} নাম`} {...f(`review${n}Name` as keyof AboutContent)} />
            <Field label="এলাকা" {...f(`review${n}Location` as keyof AboutContent)} />
            <Field label="রেটিং (১–৫)" hint="সংখ্যা" {...f(`review${n}Stars` as keyof AboutContent)} />
          </div>
          <Field label="রিভিউ" multiline rows={3} {...f(`review${n}Body` as keyof AboutContent)} />
        </div>
      ))}

      <SectionHeader label="কমিউনিটি / সোশ্যাল মিডিয়া" />
      <Field label="সেকশন শিরোনাম" {...f("communityTitle")} />
      <Field label="বিবরণ" multiline rows={3} {...f("communityBody")} />
      <Field label="Facebook লিংক" hint="https://facebook.com/..." {...f("communityFbLink")} />
      <Field label="Instagram লিংক" hint="https://instagram.com/..." {...f("communityIgLink")} />

      <SectionHeader label="সাধারণ প্রশ্নোত্তর / FAQ (৪টি)" />
      <Field label="সেকশন শিরোনাম" {...f("faqTitle")} />
      {([1, 2, 3, 4] as const).map((n) => (
        <div key={n} className="p-3 rounded-xl border space-y-2" style={{ borderColor: "var(--line)" }}>
          <Field label={`#${n} প্রশ্ন`} {...f(`faq${n}Q` as keyof AboutContent)} />
          <Field label="উত্তর" multiline rows={2} {...f(`faq${n}A` as keyof AboutContent)} />
        </div>
      ))}

      <SectionHeader label="সমাপনী সেকশন" />
      <Field label="শিরোনাম" {...f("closingTitle")} />
      <Field label="বিবরণ" multiline rows={3} {...f("closingBody")} />
    </div>
  );
}

function buildAboutFromPage(page: Record<string, unknown>): AboutContent {
  const def = CONTENT_DEFAULTS["about"];
  const keys = Object.keys(def) as (keyof AboutContent)[];
  const result = { ...def } as AboutContent;
  for (const k of keys) {
    if (page[k] !== undefined) {
      // boolean fields stored as actual boolean or "true"/"false" string
      if (typeof def[k] === "boolean") {
        (result as unknown as Record<string, unknown>)[k] = page[k] === false ? false : page[k] !== "false";
      } else {
        (result as unknown as Record<string, unknown>)[k] = page[k];
      }
    }
  }
  return result;
}

export default function PagesEditor({ pages }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSlug, setSelectedSlug] = useState<ContentSlug>("about");
  const [body, setBody] = useState(() => pages["about"]?.body ?? "");
  const [aboutData, setAboutData] = useState<AboutContent>(() => buildAboutFromPage(pages["about"] ?? {}));
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function handlePageChange(slug: ContentSlug) {
    setSelectedSlug(slug);
    setBody(pages[slug]?.body ?? "");
    setSaved(false);
    setErr("");
  }

  function handleAboutChange(k: keyof AboutContent, v: string | boolean) {
    setAboutData((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const data = selectedSlug === "about" ? aboutData : { body };
      const res = await saveContent(selectedSlug, data);
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
      router.refresh();
    });
  }

  if (selectedSlug === "size-guide") {
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {PAGE_OPTIONS.map((opt) => (
            <button key={opt.slug} type="button" onClick={() => handlePageChange(opt.slug)}
              className={`h-9 px-4 rounded-xl text-sm font-medium border transition-colors ${
                selectedSlug === opt.slug
                  ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
                  : "border-[var(--line)] text-[var(--mute)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <SizeGuideEditor data={pages["size-guide"]} />
      </div>
    );
  }

  return (
    <div className="card p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl">Static Pages</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--mute)" }}>
          স্ট্যাটিক পেজের কন্টেন্ট সম্পাদনা করুন।
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {PAGE_OPTIONS.map((opt) => (
          <button key={opt.slug} type="button" onClick={() => handlePageChange(opt.slug)}
            className={`h-9 px-4 rounded-xl text-sm font-medium border transition-colors ${
              selectedSlug === opt.slug
                ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
                : "border-[var(--line)] text-[var(--mute)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {selectedSlug === "about" ? (
          <AboutForm data={aboutData} onChange={handleAboutChange} />
        ) : (
          <RichTextEditor
            key={selectedSlug}
            initialHtml={body}
            label={PAGE_OPTIONS.find((p) => p.slug === selectedSlug)?.label}
            placeholder="পেজের কন্টেন্ট লিখুন — শিরোনাম, প্যারাগ্রাফ, লিস্ট ব্যবহার করতে পারেন…"
            onChange={(html) => { setBody(html); setSaved(false); }}
          />
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
