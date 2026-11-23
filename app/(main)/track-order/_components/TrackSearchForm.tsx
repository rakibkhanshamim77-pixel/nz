"use client";

import { useEffect, useState } from "react";
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

interface Props {
  initialPhone?: string;
  initialOrderId?: string;
}

export default function TrackSearchForm({ initialPhone = "", initialOrderId = "" }: Props) {
  const [phone, setPhone] = useState(initialPhone);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [orders, setOrders] = useState<TrackData[] | null>(null);
  const [selected, setSelected] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(ph: string, oid?: string) {
    const trimOid = oid?.trim().toUpperCase();
    const normalizedPhone = ph ? normPhone(ph) : "";
    setError("");

    // Allow orderNumber-only lookup (from SMS deep-link)
    const hasPhone = /^01[3-9]\d{8}$/.test(normalizedPhone);
    if (!hasPhone && !trimOid) {
      setError("সঠিক মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)।");
      return;
    }
    if (!hasPhone && !trimOid) return;

    setLoading(true);
    setOrders(null);
    setSelected(null);

    try {
      const params = new URLSearchParams();
      if (hasPhone) params.set("phone", normalizedPhone);
      if (trimOid) params.set("orderNumber", trimOid);

      const res = await fetch(`/api/track?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error === "notfound"
            ? trimOid && !hasPhone
              ? "এই অর্ডার আইডিতে কোনো অর্ডার পাওয়া যায়নি।"
              : trimOid
              ? "এই নম্বর ও অর্ডার আইডিতে কোনো অর্ডার পাওয়া যায়নি।"
              : "এই মোবাইল নম্বরে কোনো অর্ডার পাওয়া যায়নি।"
            : "সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
        );
        return;
      }

      // Single order or specific lookup → show detail directly
      if (trimOid || data.orders.length === 1) {
        setSelected(data.orders[0]);
      } else {
        setOrders(data.orders);
      }
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  // Auto-fetch when orderId is in the URL — no phone needed
  useEffect(() => {
    if (initialOrderId) {
      lookup("", initialOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookup(phone, orderId);
  }

  return (
    <>
      {/* ── Search form ── */}
      <form onSubmit={onSubmit} className="card p-5 sm:p-7" noValidate>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <label className="block">
            <span className="lbl">মোবাইল নম্বর *</span>
            <input
              value={phone}
              onChange={(e) => {
                setError("");
                setPhone(toEn(e.target.value).replace(/[^\d+]/g, ""));
              }}
              className={`inp${error ? " err" : ""}`}
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              autoComplete="tel-national"
              maxLength={14}
              aria-label="মোবাইল নম্বর"
            />
          </label>

          <label className="block">
            <span className="lbl">অর্ডার আইডি (ঐচ্ছিক)</span>
            <input
              value={orderId}
              onChange={(e) => {
                setError("");
                setOrderId(e.target.value.replace(/\s/g, "").toUpperCase());
              }}
              className="inp"
              placeholder="NEE-20250101-XXXX"
              autoComplete="off"
              maxLength={30}
              aria-label="অর্ডার আইডি"
            />
          </label>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className="h-[52px] px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition-opacity"
          >
            {loading ? (
              <>
                <span
                  className="w-[18px] h-[18px] rounded-full border-2 border-current border-r-transparent animate-spin"
                  aria-hidden="true"
                />
                <span>খোঁজা হচ্ছে…</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx={11} cy={11} r={7} />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span>অর্ডার ট্র্যাক করুন</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-[var(--mute)] mt-3">
          * শুধু মোবাইল নম্বর দিলে আপনার সব অর্ডার দেখাবে। অর্ডার আইডি দিলে সরাসরি সেই অর্ডার দেখাবে।
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-600">
            ⚠ {error}
          </p>
        )}
      </form>

      {/* ── Order list ── */}
      {orders && !selected && (
        <TrackOrderList orders={orders} onSelect={setSelected} />
      )}

      {/* ── Order detail ── */}
      {selected && (
        <div className="mt-6">
          {orders && orders.length > 1 && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink transition-colors mb-5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              সব অর্ডারে ফিরুন
            </button>
          )}
          <TrackResult order={selected} />
        </div>
      )}
    </>
  );
}
