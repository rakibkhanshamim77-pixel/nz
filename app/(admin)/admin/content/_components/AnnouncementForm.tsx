"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { AnnouncementContent } from "@/db/content";

export default function AnnouncementForm({
  initial,
}: {
  initial: AnnouncementContent;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set<K extends keyof AnnouncementContent>(
    k: K,
    v: AnnouncementContent[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent("announcement", form);
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
          <h2 className="font-display font-bold text-xl">Announcement Bar</h2>
          <p className="text-sm text-[var(--mute)] mt-0.5">
            সাইটের একদম উপরে দেখানো নোটিশ বার।
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
        <label className="field block">
          <span className="lbl">বাম পাশের টেক্সট</span>
          <input
            className="inp"
            value={form.left}
            onChange={(e) => set("left", e.target.value)}
            placeholder="সারা বাংলাদেশে ফ্রি ডেলিভারি…"
          />
        </label>

        <label className="field block">
          <span className="lbl">
            ডান পাশের টেক্সট{" "}
            <span className="font-normal text-[var(--mute)]">(ঐচ্ছিক)</span>
          </span>
          <input
            className="inp"
            value={form.right}
            onChange={(e) => set("right", e.target.value)}
            placeholder="কোড NZ10 দিয়ে ১০% ছাড়…"
          />
        </label>

        <label className="field block">
          <span className="lbl">
            লিঙ্ক{" "}
            <span className="font-normal text-[var(--mute)]">(ঐচ্ছিক)</span>
          </span>
          <input
            className="inp"
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
            placeholder="/shop"
          />
        </label>

        <label className="field block">
          <span className="lbl">ব্যাকগ্রাউন্ড রঙ</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.bgColor}
              onChange={(e) => set("bgColor", e.target.value)}
              className="w-10 h-10 rounded-lg border border-[var(--line)] cursor-pointer p-0.5 bg-transparent"
            />
            <input
              className="inp flex-1"
              value={form.bgColor}
              onChange={(e) => set("bgColor", e.target.value)}
              placeholder="#000000"
            />
          </div>
        </label>

        {/* Preview */}
        <div
          className="rounded-xl px-4 py-2.5 text-sm flex items-center justify-between gap-4"
          style={{ backgroundColor: form.bgColor, color: "#fff" }}
        >
          <span className="truncate">{form.left || "বাম পাশের টেক্সট"}</span>
          {form.right && (
            <span className="hidden sm:block shrink-0 text-xs">{form.right}</span>
          )}
        </div>

        {err && (
          <p className="text-sm text-red-600 font-medium">⚠ {err}</p>
        )}
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
