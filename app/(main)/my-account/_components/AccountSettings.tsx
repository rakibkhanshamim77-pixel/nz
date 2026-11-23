"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/db/actions/auth.action";

const PREFS_KEY = "neeshanz_notif_prefs";

interface Prefs {
  smsOrder: boolean;
  promo: boolean;
  emailReceipt: boolean;
}

const DEFAULT_PREFS: Prefs = { smsOrder: true, promo: false, emailReceipt: false };

export default function AccountSettings() {
  const router = useRouter();
  const [prefs, setPrefs]           = useState<Prefs>(DEFAULT_PREFS);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored) as Prefs);
    } catch {}
  }, []);

  function toggle(key: keyof Prefs) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.replace("/login");
    });
  }

  const toggles: { key: keyof Prefs; title: string; desc: string }[] = [
    { key: "smsOrder",     title: "অর্ডার আপডেট SMS",    desc: "অর্ডারের প্রতিটি ধাপে SMS পাবেন" },
    { key: "promo",        title: "অফার ও নতুন কালেকশন", desc: "ডিসকাউন্ট ও নতুন পণ্যের খবর" },
    { key: "emailReceipt", title: "ইমেইল রিসিট",         desc: "প্রতিটি অর্ডারের রিসিট ইমেইলে" },
  ];

  return (
    <section id="settings" className="card p-5 sm:p-7">
      <h2 className="font-display font-bold text-xl mb-5">নোটিফিকেশন</h2>

      <div className="divide-y divide-[var(--line)]">
        {toggles.map(({ key, title, desc }, i) => (
          <label
            key={key}
            className={`flex items-center justify-between gap-4 py-4 cursor-pointer ${
              i === 0 ? "first:pt-0" : ""
            } ${i === toggles.length - 1 ? "last:pb-0" : ""}`}
          >
            <span>
              <b className="block">{title}</b>
              <span className="text-sm text-mute">{desc}</span>
            </span>
            <span className="switch">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => toggle(key)}
              />
              <span />
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-line">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="h-11 px-5 rounded-xl border border-line font-semibold hover:bg-soft disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h11" />
          </svg>
          {isPending ? "লগআউট হচ্ছে…" : "লগআউট"}
        </button>
      </div>
    </section>
  );
}
