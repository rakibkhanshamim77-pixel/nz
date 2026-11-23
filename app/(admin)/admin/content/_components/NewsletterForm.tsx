"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { NewsletterContent } from "@/db/content";

export default function NewsletterForm({
  initial,
  subscriberCount,
}: {
  initial: NewsletterContent;
  subscriberCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set<K extends keyof NewsletterContent>(k: K, v: NewsletterContent[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent("newsletter", form);
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="card p-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl">Newsletter</h2>
          <p className="text-sm text-[var(--mute)] mt-0.5">
            হোমপেজের নিউজলেটার সেকশন সেটিংস।
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <span
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.isEnabled ? "bg-[var(--ink)]" : "bg-[var(--line)]"
            }`}
            onClick={() => set("isEnabled", !form.isEnabled)}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                form.isEnabled ? "translate-x-5" : ""
              }`}
            />
          </span>
          <span className="text-sm font-medium">
            {form.isEnabled ? "দেখানো হচ্ছে" : "লুকানো"}
          </span>
        </label>
      </div>

      {/* Subscriber count */}
      <div className="mb-6 p-4 rounded-2xl bg-[var(--soft)] flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--ink)] text-[var(--bg)] grid place-items-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
        </div>
        <div>
          <p className="font-display font-extrabold text-2xl leading-none">{subscriberCount}</p>
          <p className="text-xs text-[var(--mute)] mt-0.5">মোট সাবস্ক্রাইবার</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="field block">
          <span className="lbl">শিরোনাম</span>
          <input
            className="inp"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="নতুন কালেকশনের খবর আগে পান"
            required
          />
        </label>

        <label className="field block">
          <span className="lbl">বিবরণ</span>
          <input
            className="inp"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="ইমেইল দিন, প্রথম অর্ডারে ১০% ছাড়ের কোড পাবেন।"
          />
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
