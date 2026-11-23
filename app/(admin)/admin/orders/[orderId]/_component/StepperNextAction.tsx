"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NEXT_DESC: Record<string, string> = {
  confirmed: "Confirm the order after payment check.",
  processing: "Start packing the items.",
  shipped: "Hand over to courier and add the tracking code.",
  delivered: "Mark as delivered once the courier confirms.",
};

const NEXT_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
};

interface Props {
  orderId: string;
  nextStatus: string;
}

export default function StepperNextAction({ orderId, nextStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const label = NEXT_LABEL[nextStatus] ?? nextStatus;

  async function advance() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 pt-5 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
      <div>
        <b className="block text-sm">Next step: {label}</b>
        <span className="text-sm text-[var(--mute)]">
          {NEXT_DESC[nextStatus] ?? ""}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={advance}
          disabled={loading}
          className="btn-solid !h-10 !px-5 text-sm disabled:opacity-50"
        >
          {loading ? "Saving…" : `Mark as ${label} →`}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
