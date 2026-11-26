"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/app/context/CurrencyProvider";

const STATUS_FLOW = [
  { value: "pending", label: "Payment pending", desc: "Waiting for TrxID check" },
  { value: "confirmed", label: "Confirmed", desc: "Payment OK, ready to pack" },
  { value: "processing", label: "Packing", desc: "Being packed at warehouse" },
  { value: "shipped", label: "Shipped", desc: "Handed to courier" },
  { value: "delivered", label: "Delivered", desc: "Customer received it" },
  { value: "cancelled", label: "Cancelled", desc: "Stop this order" },
];

interface Props {
  orderId: string;
  currentStatus: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateStatusModal({
  orderId,
  currentStatus,
  orderNumber,
  customerName,
  totalAmount,
  isOpen,
  onClose,
}: Props) {
  const router = useRouter();
  const { fmt } = useCurrency();
  const currentIdx = STATUS_FLOW.findIndex((s) => s.value === currentStatus);
  const defaultNext =
    currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 2
      ? STATUS_FLOW[currentIdx + 1].value
      : currentStatus;

  const [selected, setSelected] = useState(defaultNext);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected(defaultNext);
      setNote("");
      setError("");
    }
  }, [isOpen, defaultNext]);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  async function handleSave() {
    if (selected === currentStatus && !note.trim()) {
      setError("Pick a new status or add a note");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: Record<string, string> = {};
      if (selected !== currentStatus) body.status = selected;
      if (note.trim()) body.adminNote = note.trim();

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
      onClose();
    } catch {
      setError("Failed to update status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const selectedItem = STATUS_FLOW.find((s) => s.value === selected);
  const selectedLabel = selectedItem?.label ?? selected;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stTitle"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={close} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-[520px] max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[var(--bg)] border border-[var(--line)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg)] z-10 px-6 sm:px-7 pt-6 pb-4 border-b border-[var(--line)] flex items-start justify-between gap-4">
          <div>
            <h2
              id="stTitle"
              className="font-display font-extrabold text-xl sm:text-2xl tracking-tight"
            >
              Update order status
            </h2>
            <p className="text-sm text-[var(--mute)] mt-0.5">
              <b className="text-[var(--ink)] font-display tracking-wide">
                NZ-{orderNumber}
              </b>{" "}
              · {customerName} · {fmt(totalAmount)}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-10 h-10 rounded-full border border-[var(--line)] grid place-items-center hover:bg-[var(--soft)] shrink-0"
            aria-label="Close"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              viewBox="0 0 24 24"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-7 py-5 flex-1">
          <div className="grid gap-2" role="radiogroup" aria-label="New status">
            {STATUS_FLOW.map((s, i) => {
              const isCurrent = s.value === currentStatus;
              const isNext = s.value === defaultNext && s.value !== currentStatus;
              const isPast =
                s.value !== "cancelled" &&
                currentIdx >= 0 &&
                STATUS_FLOW.findIndex((x) => x.value === s.value) < currentIdx;
              const isSelected = s.value === selected;

              return (
                <label key={s.value}>
                  <input
                    type="radio"
                    name="nst"
                    value={s.value}
                    checked={isSelected}
                    onChange={() => setSelected(s.value)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setSelected(s.value)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-[1.5px] cursor-pointer transition-all ${
                      isSelected
                        ? "border-[var(--ink)] bg-[var(--soft)]"
                        : "border-[var(--line)] hover:border-[color-mix(in_srgb,var(--ink)_35%,var(--line))]"
                    } ${isPast ? "opacity-60" : ""}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full border-[1.5px] grid place-items-center text-xs font-extrabold font-display shrink-0 transition-all ${
                        isSelected
                          ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--bg)]"
                          : isPast
                            ? "bg-[var(--soft)] border-[var(--soft)] text-[var(--mute)]"
                            : "border-[var(--line)]"
                      }`}
                    >
                      {s.value === "cancelled" ? "✕" : isPast ? "✓" : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="text-sm block">{s.label}</b>
                      <small className="text-xs text-[var(--mute)]">{s.desc}</small>
                    </span>
                    <span className="text-xs font-bold text-[var(--mute)] shrink-0">
                      {isCurrent ? "Current ✓" : isNext ? "Next" : ""}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Note */}
          <label className="block mt-5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--mute)] mb-2">
              Internal note{" "}
              <span className="font-normal normal-case">(optional)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="inp w-full text-sm"
              style={{
                height: "auto",
                minHeight: 76,
                paddingTop: 12,
                paddingBottom: 12,
              }}
              placeholder="Visible to admins only"
              maxLength={200}
              rows={3}
            />
          </label>

          {error && (
            <p className="text-sm font-semibold text-red-600 mt-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[var(--bg)] px-6 sm:px-7 py-4 border-t border-[var(--line)] flex gap-3">
          <button
            type="button"
            onClick={close}
            className="btn-ghost flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-solid flex-[1.4] justify-center disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : selected === currentStatus
                ? "Save note"
                : selected === "cancelled"
                  ? "Cancel order"
                  : `Mark as ${selectedLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
