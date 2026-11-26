"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  orderId: string;
  payment: {
    gateway?: string;
    transactionId?: string;
    amount: number;
    status: string;
    verifiedAt?: string;
    rejectionReason?: string;
  };
}

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 py-2 border-b border-[var(--line)] last:border-0">
      <span className="text-sm text-[var(--mute)] shrink-0">{label}</span>
      <span className="text-sm font-semibold text-right truncate">{value}</span>
    </div>
  );
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const isStripePayment = (gateway?: string, txId?: string) =>
  gateway === "stripe" || !!txId?.startsWith("pi_");

export default function AdminPaymentActions({ orderId, payment }: Props) {
  const router = useRouter();
  const { fmt } = useCurrency();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<"synced" | "already_paid" | "not_succeeded" | null>(null);
  const [error, setError] = useState("");

  const isStripe = isStripePayment(payment.gateway, payment.transactionId);
  const isPaid = payment.status === "paid";
  const isPending = payment.status === "pending" || payment.status === "processing";

  const handleStripeSync = async () => {
    if (!payment.transactionId) return;
    setSyncing(true);
    setError("");
    setSyncResult(null);
    try {
      const res = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: payment.transactionId, orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");

      if (data.status === "succeeded" && data.synced) {
        setSyncResult("synced");
        router.refresh();
      } else if (data.status === "succeeded" && !data.synced) {
        setSyncResult("already_paid");
        router.refresh();
      } else {
        setSyncResult("not_succeeded");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (!payment.transactionId && !payment.gateway) {
    return (
      <p className="text-sm text-[var(--mute)] bg-[var(--soft)] rounded-2xl px-4 py-3">
        No payment submitted yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment details */}
      <div className="rounded-2xl border border-[var(--line)] px-4 py-1">
        <KVRow
          label="Gateway"
          value={
            <span className="flex items-center gap-1.5">
              {isStripe ? (
                <>
                  <svg className="w-3.5 h-3.5 text-[#635bff]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                  </svg>
                  Stripe
                </>
              ) : (
                payment.gateway ?? "—"
              )}
            </span>
          }
        />
        <KVRow
          label="Payment Intent"
          value={<span className="font-mono text-xs">{payment.transactionId ?? "—"}</span>}
        />
        <KVRow label="Amount" value={fmt(payment.amount)} />
        {payment.verifiedAt && (
          <KVRow label="Paid at" value={fmtDate(payment.verifiedAt)} />
        )}
      </div>

      {/* Stripe sync */}
      {isStripe && (
        <>
          {isPaid ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-green-50 border border-green-200">
              <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="m5 12 5 5L20 7" />
              </svg>
              <span className="text-sm font-semibold text-green-800">Payment confirmed by Stripe</span>
            </div>
          ) : isPending ? (
            <div className="space-y-3 pt-2 border-t border-[var(--line)]">
              <p className="text-sm text-[var(--mute)]">
                Payment may have completed but status hasn&apos;t synced yet. Click to check with Stripe.
              </p>
              <button
                type="button"
                onClick={handleStripeSync}
                disabled={syncing}
                className="w-full h-10 rounded-2xl bg-[#635bff] text-white font-semibold text-sm hover:bg-[#5a53e6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Syncing with Stripe…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M4 12v-1a8 8 0 0 1 8-8 8 8 0 0 1 5.3 2M20 12v1a8 8 0 0 1-8 8 8 8 0 0 1-5.3-2" />
                      <path d="m15 9 5-5-5-5M9 15l-5 5 5 5" />
                    </svg>
                    Sync with Stripe
                  </>
                )}
              </button>

              {syncResult === "synced" && (
                <p className="text-sm text-green-700 font-medium bg-green-50 px-3 py-2 rounded-xl">
                  ✓ Payment confirmed and order updated.
                </p>
              )}
              {syncResult === "already_paid" && (
                <p className="text-sm text-green-700 font-medium bg-green-50 px-3 py-2 rounded-xl">
                  ✓ Already paid — refreshing.
                </p>
              )}
              {syncResult === "not_succeeded" && (
                <p className="text-sm text-amber-700 font-medium bg-amber-50 px-3 py-2 rounded-xl">
                  Payment not yet completed on Stripe&apos;s end.
                </p>
              )}
            </div>
          ) : null}
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}
    </div>
  );
}
