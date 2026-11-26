"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NEXT_LABELS: Record<string, string> = {
  confirmed: "Confirm",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
};

interface Props {
  orderId: string;
  nextStatus: string;
}

export default function QuickStatusButton({ orderId, nextStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const label = NEXT_LABELS[nextStatus] ?? nextStatus;

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      // silent fail — user can click again
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="btn-ghost !h-8 !px-3 !rounded-[10px] text-xs disabled:opacity-50"
    >
      {loading ? "…" : `→ ${label}`}
    </button>
  );
}
