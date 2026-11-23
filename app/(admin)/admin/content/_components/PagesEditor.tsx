"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { ContentSlug } from "@/db/content";

const PAGE_OPTIONS = [
  { slug: "about" as ContentSlug, label: "About Us / আমাদের সম্পর্কে" },
  { slug: "terms" as ContentSlug, label: "Terms & Conditions / শর্তাবলী" },
  { slug: "return-policy" as ContentSlug, label: "Return Policy / রিটার্ন পলিসি" },
  { slug: "privacy" as ContentSlug, label: "Privacy Policy / প্রাইভেসি পলিসি" },
];

interface Props {
  pages: Record<string, { body: string }>;
}

export default function PagesEditor({ pages }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSlug, setSelectedSlug] = useState<ContentSlug>("about");
  const [body, setBody] = useState(() => pages["about"]?.body ?? "");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function handlePageChange(slug: ContentSlug) {
    setSelectedSlug(slug);
    setBody(pages[slug]?.body ?? "");
    setSaved(false);
    setErr("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent(selectedSlug, { body });
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="card p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl">Static Pages</h2>
        <p className="text-sm text-[var(--mute)] mt-0.5">
          স্ট্যাটিক পেজের মূল কন্টেন্ট সম্পাদনা করুন।
        </p>
      </div>

      {/* Page selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PAGE_OPTIONS.map((opt) => (
          <button
            key={opt.slug}
            type="button"
            onClick={() => handlePageChange(opt.slug)}
            className={`h-9 px-4 rounded-xl text-sm font-medium border transition-colors ${
              selectedSlug === opt.slug
                ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
                : "border-[var(--line)] text-[var(--mute)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
            }`}
          >
            {opt.label.split(" / ")[1] || opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="field block">
          <span className="lbl">
            {PAGE_OPTIONS.find((p) => p.slug === selectedSlug)?.label}
          </span>
          <textarea
            rows={12}
            className="inp font-mono text-sm"
            style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
            value={body}
            onChange={(e) => { setBody(e.target.value); setSaved(false); }}
            placeholder="পেজের মূল কন্টেন্ট লিখুন…"
          />
          <p className="text-xs text-[var(--mute)] mt-1">
            সাধারণ টেক্সট লিখুন। প্যারাগ্রাফ ভাগ করতে ফাঁকা লাইন ব্যবহার করুন।
          </p>
        </label>

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ সংরক্ষিত হয়েছে</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-40">
            {isPending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
