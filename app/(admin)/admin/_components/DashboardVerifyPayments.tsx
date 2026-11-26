"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrency } from "@/app/context/CurrencyProvider";

export interface PendingPayment {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  gateway: string;
  transactionId?: string;
  senderAccount?: string;
  submittedAt?: string;
}

interface Props {
  payments: PendingPayment[];
}

const GATEWAY_STYLE: Record<string, { label: string; color: string }> = {
  bkash:  { label: "bKash",  color: "#e31e6b" },
  nagad:  { label: "Nagad",  color: "#f26f21" },
  rocket: { label: "Rocket", color: "#8b2fc9" },
  "":     { label: "COD",    color: "#6b7280" },
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardVerifyPayments({ payments }: Props) {
  const router = useRouter();
  const { fmt } = useCurrency();
  const [loading, setLoading] = useState<string | null>(null);

  async function patch(orderId: string, paymentStatus: string) {
    setLoading(orderId + paymentStatus);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display font-bold text-lg">Verify Payments</h2>
          {payments.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold"
              style={{ background: "#f59e0b1a", color: "#f59e0b" }}>
              {payments.length}
            </span>
          )}
        </div>
        <Link href="/admin/orders?payment=pending"
          className="text-xs font-semibold hover:text-[var(--ink)] transition-colors"
          style={{ color: "var(--mute)" }}>
          View all →
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "#16a34a1a" }}>
            <svg className="w-5 h-5" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-sm font-medium">All caught up!</p>
          <p className="text-xs" style={{ color: "var(--mute)" }}>No pending payments to verify.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {payments.map((p) => {
            const busy = loading?.startsWith(p.orderId);
            const gw = GATEWAY_STYLE[p.gateway] ?? { label: p.gateway, color: "#6b7280" };
            return (
              <li key={p.orderId}
                className="rounded-2xl border p-4 transition-colors"
                style={{ borderColor: "var(--line)", background: "var(--surface)" }}>

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/orders/${p.orderId}`}
                        className="font-bold font-display text-sm hover:underline underline-offset-2">
                        #{p.orderNumber}
                      </Link>
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-bold"
                        style={{ background: gw.color + "1a", color: gw.color }}>
                        {gw.label}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--mute)" }}>
                      {p.customerName} · {p.customerPhone}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold font-display text-sm">{fmt(p.amount)}</p>
                    {p.submittedAt && (
                      <p className="text-[10px]" style={{ color: "var(--mute)" }}>{timeAgo(p.submittedAt)}</p>
                    )}
                  </div>
                </div>

                {/* Transaction info */}
                {(p.transactionId || p.senderAccount) && (
                  <div className="mb-3 px-3 py-2 rounded-xl text-xs space-y-1" style={{ background: "var(--soft)" }}>
                    {p.transactionId && (
                      <p className="flex items-center gap-2">
                        <span style={{ color: "var(--mute)" }}>TrxID</span>
                        <code className="font-bold tracking-wide">{p.transactionId}</code>
                      </p>
                    )}
                    {p.senderAccount && (
                      <p className="flex items-center gap-2">
                        <span style={{ color: "var(--mute)" }}>From</span>
                        <span className="font-semibold">{p.senderAccount}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button type="button" disabled={!!busy}
                    onClick={() => patch(p.orderId, "paid")}
                    className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    style={{ background: "#16a34a", color: "#fff" }}>
                    {loading === p.orderId + "paid" ? (
                      <span className="spin" />
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Confirm
                      </>
                    )}
                  </button>
                  <button type="button" disabled={!!busy}
                    onClick={() => patch(p.orderId, "failed")}
                    className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/10"
                    style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                    {loading === p.orderId + "failed" ? (
                      <span className="spin" />
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </>
                    )}
                  </button>
                  <Link href={`/admin/orders/${p.orderId}`}
                    className="w-9 h-9 rounded-xl border grid place-items-center transition-colors hover:bg-[var(--soft)] shrink-0"
                    style={{ borderColor: "var(--line)", color: "var(--mute)" }}
                    title="View order details">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                    </svg>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
