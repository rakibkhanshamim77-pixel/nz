"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  payment: {
    gateway?: string;
    transactionId?: string;
    senderAccount?: string;
    receiverNumber?: string;
    amount: number;
    screenshotDisplayUrl?: string;
    screenshotUrl?: string;
    submittedAt?: string;
    status: string;
    verifiedAt?: string;
    rejectionReason?: string;
  };
}

const GATEWAY_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
};

function fmt(n: number) {
  return "BDT " + n.toLocaleString("en-US");
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Not submitted",
  processing: "Awaiting verification",
  paid: "Verified ✓",
  failed: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 py-2 border-b border-[var(--line)] last:border-0">
      <span className="text-sm text-[var(--mute)] shrink-0">{label}</span>
      <span className="text-sm font-semibold text-right truncate">{value}</span>
    </div>
  );
}

export default function AdminPaymentActions({ orderId, payment }: Props) {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState("");
  const [screenshotOpen, setScreenshotOpen] = useState(false);

  const canVerify = payment.status === "processing";
  const hasSubmission = !!payment.gateway;

  const handleVerify = async () => {
    if (!confirm("Mark this payment as verified?")) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please enter a rejection reason");
      return;
    }
    setRejecting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed");
      }
      setShowRejectForm(false);
      setRejectReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rejection failed");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--mute)]">Payment status</span>
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            STATUS_COLORS[payment.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABELS[payment.status] ?? payment.status}
        </span>
      </div>

      {!hasSubmission && (
        <p className="text-sm text-[var(--mute)] bg-[var(--soft)] rounded-2xl px-4 py-3">
          Customer has not submitted payment details yet.
        </p>
      )}

      {hasSubmission && (
        <div className="space-y-0 rounded-2xl border border-[var(--line)] px-4 py-1">
          <KVRow
            label="Gateway"
            value={GATEWAY_LABELS[payment.gateway!] ?? payment.gateway}
          />
          <KVRow
            label="Receiver"
            value={
              <span className="font-mono text-xs">
                {payment.receiverNumber ?? "—"}
              </span>
            }
          />
          <KVRow
            label="Sender"
            value={
              <span className="font-mono text-xs">
                {payment.senderAccount ?? "—"}
              </span>
            }
          />
          <KVRow
            label="Transaction ID"
            value={
              <span className="font-mono text-xs">
                {payment.transactionId ?? "—"}
              </span>
            }
          />
          <KVRow label="Amount" value={fmt(payment.amount)} />
          <KVRow label="Submitted" value={fmtDate(payment.submittedAt)} />
          {payment.verifiedAt && (
            <KVRow label="Verified at" value={fmtDate(payment.verifiedAt)} />
          )}
          {payment.rejectionReason && (
            <div className="pt-3 pb-2">
              <p className="text-xs text-[var(--mute)] mb-1">Rejection reason</p>
              <p className="text-sm text-red-700">{payment.rejectionReason}</p>
            </div>
          )}
        </div>
      )}

      {/* Screenshot preview card */}
      {payment.screenshotDisplayUrl && (
        <button
          type="button"
          onClick={() => setScreenshotOpen(true)}
          className="w-full group rounded-2xl border border-[var(--line)] overflow-hidden hover:border-[var(--ink)] transition-colors text-left"
          aria-label="View payment screenshot"
        >
          {/* Thumbnail strip */}
          <div className="relative h-28 bg-[var(--soft)] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={payment.screenshotDisplayUrl}
              alt="Payment screenshot"
              className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M15 3h6m0 0v6m0-6-7 7M10 4H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-6" />
                </svg>
                View full size
              </span>
            </div>
          </div>
          {/* Footer */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-2 bg-[var(--surface)]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <svg className="w-4 h-4 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x={3} y={3} width={18} height={18} rx={2} />
                <path d="m3 15 5-5 4 4 3-3 5 5" />
                <circle cx={8.5} cy={8.5} r={1.5} />
              </svg>
              Payment screenshot
            </div>
            <span className="text-xs text-[var(--mute)]">Click to expand</span>
          </div>
        </button>
      )}

      {/* Admin verify / reject actions */}
      {canVerify && (
        <div className="space-y-2 pt-3 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full h-10 rounded-2xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="m5 12 5 5L20 7" />
            </svg>
            {verifying ? "Verifying…" : "Verify payment"}
          </button>

          {!showRejectForm ? (
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="w-full h-10 rounded-2xl border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
              Reject payment
            </button>
          ) : (
            <div className="space-y-2 p-3 rounded-2xl border border-red-200 bg-red-50/50">
              <label className="lbl !text-red-700">Rejection reason *</label>
              <textarea
                className="inp text-sm"
                rows={2}
                style={{ height: "auto", paddingTop: 8, paddingBottom: 8 }}
                placeholder="e.g. TrxID not found in merchant statement"
                value={rejectReason}
                onChange={(e) => { setRejectReason(e.target.value); setError(""); }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={rejecting}
                  className="flex-1 h-9 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {rejecting ? "Rejecting…" : "Confirm reject"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectForm(false); setError(""); }}
                  className="flex-1 h-9 rounded-xl border border-[var(--line)] text-sm font-semibold hover:bg-[var(--soft)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}

      {/* Screenshot lightbox */}
      {screenshotOpen && payment.screenshotDisplayUrl && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setScreenshotOpen(false)}
        >
          <div
            className="relative max-w-xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setScreenshotOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={payment.screenshotDisplayUrl}
              alt="Payment screenshot"
              className="w-full rounded-2xl shadow-2xl"
            />
            <a
              href={payment.screenshotDisplayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M15 3h6m0 0v6m0-6-7 7M10 4H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-6" />
              </svg>
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
