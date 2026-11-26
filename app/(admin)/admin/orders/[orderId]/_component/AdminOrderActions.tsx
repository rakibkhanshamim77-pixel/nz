"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

interface Props {
  orderId: string;
  showStatusForm?: boolean;
}

export default function AdminOrderActions({ orderId, showStatusForm = false }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    setNoteError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim(), isInternal }),
      });
      if (!res.ok) throw new Error("Failed");
      setNote("");
      router.refresh();
    } catch {
      setNoteError("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdate = async () => {
    if (!status && !paymentStatus && !trackingNumber && !courier) {
      setUpdateError("Fill in at least one field");
      return;
    }
    setUpdating(true);
    setUpdateError("");
    try {
      const body: Record<string, string> = {};
      if (status) body.status = status;
      if (paymentStatus) body.paymentStatus = paymentStatus;
      if (trackingNumber) body.trackingNumber = trackingNumber;
      if (courier) body.courier = courier;

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("");
      setPaymentStatus("");
      setTrackingNumber("");
      setCourier("");
      router.refresh();
    } catch {
      setUpdateError("Update failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (showStatusForm) {
    return (
      <div className="space-y-3">
        <div>
          <label className="lbl">Order status</label>
          <span className="sel-wrap block">
            <select
              className="inp"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">— No change —</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </span>
        </div>
        <div>
          <label className="lbl">Payment status</label>
          <span className="sel-wrap block">
            <select
              className="inp"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">— No change —</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </span>
        </div>
        <div>
          <label className="lbl">Courier</label>
          <input
            className="inp"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="e.g. Pathao, Steadfast"
          />
        </div>
        <div>
          <label className="lbl">Tracking number</label>
          <input
            className="inp font-mono uppercase"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking ID"
          />
        </div>
        {updateError && (
          <p className="text-sm text-red-600">{updateError}</p>
        )}
        <button
          type="button"
          onClick={handleUpdate}
          disabled={updating}
          className="btn-solid w-full justify-center disabled:opacity-50"
        >
          {updating ? "Saving…" : "Save changes"}
        </button>
      </div>
    );
  }

  // Note form
  return (
    <div className="pt-4 border-t border-[var(--line)]">
      <label className="lbl">Add admin note</label>
      <textarea
        className="inp"
        style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a note…"
      />
      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 text-sm text-[var(--mute)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="w-4 h-4 accent-[var(--ink)]"
          />
          Internal only
        </label>
        <button
          type="button"
          onClick={handleAddNote}
          disabled={addingNote || !note.trim()}
          className="h-9 px-5 rounded-2xl bg-[var(--ink)] text-[var(--bg)] text-sm font-semibold disabled:opacity-50 transition-opacity"
        >
          {addingNote ? "Saving…" : "Add note"}
        </button>
      </div>
      {noteError && <p className="text-sm text-red-600 mt-1">{noteError}</p>}
    </div>
  );
}
