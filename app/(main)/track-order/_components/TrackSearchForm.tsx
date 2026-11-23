"use client";

import { useState } from "react";
import { TrackData } from "./track.types";
import TrackOrderList from "./TrackOrderList";
import TrackResult from "./TrackResult";

function toEn(s: string) {
  return s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
}
function normPhone(raw: string) {
  const n = toEn(raw).replace(/\D/g, "");
  return n.startsWith("88") ? n.slice(2, 13) : n.slice(0, 11);
}

export default function TrackSearchForm() {
  const [phone,   setPhone]   = useState("");
  const [orders,  setOrders]  = useState<TrackData[] | null>(null);
  const [selected,setSelected]= useState<TrackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function lookup(ph: string) {
    const normalizedPhone = normPhone(ph);
    setError("");

    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      setError("সঠিক মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)।");
      return;
    }

    setLoading(true);
    setOrders(null);
    setSelected(null);

    try {
      const res  = await fetch(`/api/track?phone=${encodeURIComponent(normalizedPhone)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error === "notfound"
            ? "এই মোবাইল নম্বরে কোনো অর্ডার পাওয়া যায়নি।"
            : "সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।"
        );
        return;
      }

      setOrders(data.orders);
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookup(phone);
  }

  return (
    <>
      {/* ── Search form ── */}
      <form onSubmit={onSubmit} className="card p-5 sm:p-7" noValidate>
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end max-w-xl">
          <label className="block">
            <span className="lbl">মোবাইল নম্বর</span>
            <input
              value={phone}
              onChange={(e) => { setError(""); setPhone(toEn(e.target.value).replace(/[^\d+]/g, "")); }}
              className={`inp${error ? " err" : ""}`}
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              autoComplete="tel-national"
              maxLength={14}
              aria-label="মোবাইল নম্বর"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-[52px] px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
          >
            {loading ? (
              <>
                <span className="w-[18px] h-[18px] rounded-full border-2 border-current border-r-transparent animate-spin" aria-hidden="true" />
                <span>খোঁজা হচ্ছে…</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx={11} cy={11} r={7} /><path d="m20 20-3.5-3.5" />
                </svg>
                <span>অর্ডার দেখুন</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && <p role="alert" className="mt-4 text-sm font-medium">⚠ {error}</p>}

        {/* Demo hint */}
        <p className="text-xs text-mute mt-4">
          টেস্ট করতে:{" "}
          <button
            type="button"
            className="underline text-ink font-semibold"
            onClick={() => { setPhone("01712345678"); lookup("01712345678"); }}
          >
            01712345678
          </button>
        </p>
      </form>

      {/* ── Order list ── */}
      {orders && !selected && (
        <TrackOrderList orders={orders} onSelect={setSelected} />
      )}

      {/* ── Order detail ── */}
      {selected && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink transition-colors mb-5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            সব অর্ডারে ফিরুন
          </button>
          <TrackResult order={selected} />
        </div>
      )}
    </>
  );
}
