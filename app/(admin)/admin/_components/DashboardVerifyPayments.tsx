"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const GATEWAY_NAME: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  "": "Cash on delivery",
};

const bn = (n: number) => "৳" + Math.round(n).toLocaleString("en-US");

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

  if (payments.length === 0) {
    return (
      <section className="card p-5 sm:p-6">
        <h2 className="font-display font-bold text-lg mb-2">
          Verify Payments
        </h2>
        <p className="text-sm text-[var(--mute)]">No pending payments.</p>
      </section>
    );
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg">Verify Payments</h2>
        <Link
          href="/admin/orders?payment=pending"
          className="text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      <ul className="space-y-3">
        {payments.map((p) => {
          const busy = loading?.startsWith(p.orderId);
          return (
            <li key={p.orderId} className="card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <Link
                    href={`/admin/orders/${p.orderId}`}
                    className="font-bold font-display hover:underline"
                  >
                    #{p.orderNumber}
                  </Link>
                  <p className="text-xs text-[var(--mute)]">
                    {p.customerName} · {p.customerPhone}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-bold font-display text-sm">
                    {bn(p.amount)}
                  </span>
                  <p className="text-xs text-[var(--mute)]">
                    {GATEWAY_NAME[p.gateway] ?? p.gateway}
                  </p>
                </div>
              </div>

              {(p.transactionId || p.senderAccount) && (
                <div className="mb-3 p-2.5 rounded-xl bg-[var(--soft)] text-xs space-y-1">
                  {p.transactionId && (
                    <p>
                      <span className="text-[var(--mute)]">TrxID:</span>{" "}
                      <code className="font-bold font-display tracking-wide">
                        {p.transactionId}
                      </code>
                    </p>
                  )}
                  {p.senderAccount && (
                    <p>
                      <span className="text-[var(--mute)]">From:</span>{" "}
                      <span className="font-semibold">{p.senderAccount}</span>
                    </p>
                  )}
                  {p.submittedAt && (
                    <p className="text-[var(--mute)]">
                      {timeAgo(p.submittedAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => patch(p.orderId, "paid")}
                  className="btn-solid h-9 text-xs flex-1"
                >
                  {loading === p.orderId + "paid" ? (
                    <span className="spin" />
                  ) : (
                    "Confirm"
                  )}
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => patch(p.orderId, "failed")}
                  className="btn-ghost h-9 text-xs flex-1"
                >
                  {loading === p.orderId + "failed" ? (
                    <span className="spin" />
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
