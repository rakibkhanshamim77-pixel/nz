"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { SaleBannerContent } from "@/db/content";

export default function SaleBannerForm({
  initial,
}: {
  initial: SaleBannerContent;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set<K extends keyof SaleBannerContent>(
    k: K,
    v: SaleBannerContent[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent("sale-banner", form);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="card p-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl">Sale Banner</h2>
          <p className="text-sm text-[var(--mute)] mt-0.5">
            হোমপেজে সেল ব্যানার।
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
            {form.isEnabled ? "চালু" : "বন্ধ"}
          </span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="field block">
            <span className="lbl">ব্যাজ টেক্সট</span>
            <input
              className="inp"
              value={form.badge}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="লিমিটেড অফার"
            />
          </label>

          <label className="field block">
            <span className="lbl">বাটন লিঙ্ক</span>
            <input
              className="inp"
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="/shop?onSale=1"
            />
          </label>
        </div>

        <label className="field block">
          <span className="lbl">শিরোনাম</span>
          <input
            className="inp"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="সব টি-শার্টে ৩৫% পর্যন্ত ছাড়"
            required
          />
        </label>

        <label className="field block">
          <span className="lbl">সাবটাইটেল</span>
          <input
            className="inp"
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="অফার শেষ হওয়ার আগেই বেছে নিন।"
          />
        </label>

        <label className="field block">
          <span className="lbl">বাটন টেক্সট</span>
          <input
            className="inp"
            value={form.buttonText}
            onChange={(e) => set("buttonText", e.target.value)}
            placeholder="অফার দেখুন"
          />
        </label>

        <label className="field block">
          <span className="lbl">
            কাউন্টডাউন শেষ তারিখ{" "}
            <span className="font-normal text-[var(--mute)]">(ঐচ্ছিক)</span>
          </span>
          <input
            type="datetime-local"
            className="inp"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
          <p className="text-xs text-[var(--mute)] mt-1">
            খালি রাখলে কাউন্টডাউন লুকানো থাকবে
          </p>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="field block">
            <span className="lbl">ব্যাকগ্রাউন্ড শুরু রঙ</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.bgFrom}
                onChange={(e) => set("bgFrom", e.target.value)}
                className="w-9 h-9 rounded-lg border border-[var(--line)] cursor-pointer p-0.5 bg-transparent"
              />
              <input
                className="inp flex-1"
                value={form.bgFrom}
                onChange={(e) => set("bgFrom", e.target.value)}
              />
            </div>
          </label>
          <label className="field block">
            <span className="lbl">ব্যাকগ্রাউন্ড শেষ রঙ</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.bgTo}
                onChange={(e) => set("bgTo", e.target.value)}
                className="w-9 h-9 rounded-lg border border-[var(--line)] cursor-pointer p-0.5 bg-transparent"
              />
              <input
                className="inp flex-1"
                value={form.bgTo}
                onChange={(e) => set("bgTo", e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Preview */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{
            background: `linear-gradient(120deg, ${form.bgFrom}, ${form.bgTo})`,
          }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs mb-2">
            {form.badge || "ব্যাজ"}
          </span>
          <p className="font-bold text-lg leading-tight mb-1">
            {form.title || "শিরোনাম"}
          </p>
          <p className="text-white/80 text-xs mb-3">
            {form.subtitle || "সাবটাইটেল"}
          </p>
          <span className="inline-flex h-8 items-center px-4 rounded-lg bg-white text-black text-xs font-semibold">
            {form.buttonText || "বাটন"}
          </span>
        </div>

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && (
          <p className="text-sm text-green-600 font-medium">✓ সংরক্ষিত হয়েছে</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="btn-solid disabled:opacity-40"
          >
            {isPending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
