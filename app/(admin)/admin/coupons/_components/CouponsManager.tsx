"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CouponRow } from "./couponsConstants";
import { fmtDate, fmtDiscount } from "./couponsConstants";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  type CouponInput,
} from "../_actions/couponAdminActions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const EMPTY_FORM: CouponInput = {
  code: "",
  type: "percentage",
  value: 0,
  minOrderAmount: 0,
  maxUses: null,
  expiresAt: null,
  description: "",
  isActive: true,
};

// ─── Form Modal ───────────────────────────────────────────────────────────────

function CouponFormModal({
  editing,
  onClose,
}: {
  editing: CouponRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const initialForm: CouponInput = editing
    ? {
        code: editing.code,
        type: editing.type,
        value: editing.value,
        minOrderAmount: editing.minOrderAmount,
        maxUses: editing.maxUses,
        expiresAt: toDateInput(editing.expiresAt) || null,
        description: editing.description ?? "",
        isActive: editing.isActive,
      }
    : EMPTY_FORM;
  const [form, setForm] = useState<CouponInput>(initialForm);

  function set<K extends keyof CouponInput>(k: K, v: CouponInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const result = editing
        ? await updateCoupon(editing._id, form)
        : await createCoupon(form);
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg)] border border-[var(--line)] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-[var(--line)]">
          <h2 className="font-display font-bold text-xl">
            {editing ? "কুপন সম্পাদনা" : "নতুন কুপন"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Code */}
          <label className="field block">
            <span className="lbl">কুপন কোড *</span>
            <input
              className="inp uppercase"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="EID20"
              required
            />
            <p className="text-xs text-[var(--mute)] mt-1">
              অক্ষর, সংখ্যা, _ এবং - ব্যবহার করুন
            </p>
          </label>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <label className="field block">
              <span className="lbl">ধরন *</span>
              <div className="sel-wrap block">
                <select
                  className="inp"
                  value={form.type}
                  onChange={(e) =>
                    set("type", e.target.value as "percentage" | "fixed")
                  }
                >
                  <option value="percentage">শতাংশ (%)</option>
                  <option value="fixed">নির্দিষ্ট পরিমাণ (BDT)</option>
                </select>
              </div>
            </label>
            <label className="field block">
              <span className="lbl">
                মান *{" "}
                <span className="font-normal text-[var(--mute)]">
                  ({form.type === "percentage" ? "%" : "BDT"})
                </span>
              </span>
              <input
                type="number"
                className="inp"
                value={form.value || ""}
                min={1}
                max={form.type === "percentage" ? 100 : undefined}
                onChange={(e) => set("value", Number(e.target.value))}
                required
              />
            </label>
          </div>

          {/* Min order + Max uses */}
          <div className="grid grid-cols-2 gap-3">
            <label className="field block">
              <span className="lbl">ন্যূনতম অর্ডার (BDT)</span>
              <input
                type="number"
                className="inp"
                value={form.minOrderAmount || ""}
                min={0}
                onChange={(e) => set("minOrderAmount", Number(e.target.value))}
                placeholder="0"
              />
            </label>
            <label className="field block">
              <span className="lbl">সর্বোচ্চ ব্যবহার</span>
              <input
                type="number"
                className="inp"
                value={form.maxUses ?? ""}
                min={1}
                onChange={(e) =>
                  set(
                    "maxUses",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="সীমাহীন"
              />
            </label>
          </div>

          {/* Expires at */}
          <label className="field block">
            <span className="lbl">মেয়াদ শেষ তারিখ</span>
            <input
              type="date"
              className="inp"
              value={form.expiresAt ?? ""}
              onChange={(e) => set("expiresAt", e.target.value || null)}
            />
          </label>

          {/* Description */}
          <label className="field block">
            <span className="lbl">বিবরণ</span>
            <input
              className="inp"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="ঈদ স্পেশাল অফার…"
            />
          </label>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <span
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isActive ? "bg-[var(--ink)]" : "bg-[var(--line)]"
              }`}
              onClick={() => set("isActive", !form.isActive)}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span className="text-sm font-medium">
              {form.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </span>
          </label>

          {err && (
            <p className="text-sm text-red-600 font-medium">⚠ {err}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={isPending}
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="btn-solid disabled:opacity-40"
              disabled={isPending}
            >
              {isPending
                ? "সংরক্ষণ হচ্ছে…"
                : editing
                  ? "আপডেট করুন"
                  : "তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

function CouponActionButtons({
  coupon,
  onEdit,
}: {
  coupon: CouponRow;
  onEdit: (c: CouponRow) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleToggleActive() {
    startTransition(async () => {
      await toggleCouponActive(coupon._id, !coupon.isActive);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      timerRef.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    startTransition(async () => {
      await deleteCoupon(coupon._id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5 justify-end flex-wrap">
      {/* Toggle active */}
      <button
        type="button"
        onClick={handleToggleActive}
        disabled={isPending}
        className="btn-ghost !h-8 !px-3 !rounded-[10px] text-xs disabled:opacity-40"
        title={coupon.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
      >
        {coupon.isActive ? "বন্ধ করুন" : "চালু করুন"}
      </button>

      {/* Edit */}
      <button
        type="button"
        onClick={() => onEdit(coupon)}
        className="icon-btn"
        title="সম্পাদনা"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className={`icon-btn disabled:opacity-40 ${confirmDelete ? "!bg-red-600 !text-white" : "hover:!text-red-600"}`}
        title={confirmDelete ? "নিশ্চিত করুন?" : "মুছুন"}
      >
        {confirmDelete ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="m5 12 5 5L20 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Desktop Table ────────────────────────────────────────────────────────────

function CouponsTable({
  coupons,
  onEdit,
}: {
  coupons: CouponRow[];
  onEdit: (c: CouponRow) => void;
}) {
  if (coupons.length === 0) {
    return (
      <section className="card hidden md:block mb-5">
        <div className="py-20 text-center text-[var(--mute)]">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-30"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6Z" />
          </svg>
          <p className="text-sm font-medium">কোনো কুপন পাওয়া যায়নি</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card hidden md:block mb-5">
      <div className="overflow-x-auto rounded-[24px]">
        <table className="ptbl w-full">
          <thead>
            <tr>
              <th>কোড</th>
              <th>ছাড়</th>
              <th>ন্যূনতম অর্ডার</th>
              <th>ব্যবহার</th>
              <th>স্ট্যাটাস</th>
              <th>মেয়াদ</th>
              <th className="text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>
                  <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm bg-[var(--soft)] border border-[var(--line)] px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                  {c.description && (
                    <p className="text-xs text-[var(--mute)] mt-1 max-w-[160px] truncate">
                      {c.description}
                    </p>
                  )}
                </td>
                <td>
                  <span className="font-semibold text-sm">
                    {fmtDiscount(c.type, c.value)}
                  </span>
                </td>
                <td>
                  <span className="text-sm">
                    {c.minOrderAmount > 0 ? `BDT ${c.minOrderAmount}` : "নেই"}
                  </span>
                </td>
                <td>
                  <span className="text-sm">
                    {c.usedCount}
                    {c.maxUses !== null && (
                      <span className="text-[var(--mute)]"> / {c.maxUses}</span>
                    )}
                  </span>
                </td>
                <td>
                  {c.isActive ? (
                    <span className="st active text-xs">
                      <i />
                      সক্রিয়
                    </span>
                  ) : (
                    <span className="st draft text-xs">
                      <i />
                      নিষ্ক্রিয়
                    </span>
                  )}
                </td>
                <td>
                  <p className="text-sm">{fmtDate(c.expiresAt)}</p>
                </td>
                <td className="text-right">
                  <CouponActionButtons coupon={c} onEdit={onEdit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Mobile Cards ─────────────────────────────────────────────────────────────

function CouponsMobileCards({
  coupons,
  onEdit,
}: {
  coupons: CouponRow[];
  onEdit: (c: CouponRow) => void;
}) {
  if (coupons.length === 0) {
    return (
      <div className="md:hidden py-16 text-center text-[var(--mute)]">
        <svg
          className="w-10 h-10 mx-auto mb-3 opacity-30"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6Z" />
        </svg>
        <p className="text-sm font-medium">কোনো কুপন পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="md:hidden grid gap-3 mb-5">
      {coupons.map((c) => (
        <div key={c._id} className="card p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm bg-[var(--soft)] border border-[var(--line)] px-2.5 py-1 rounded-lg">
                {c.code}
              </span>
              {c.description && (
                <p className="text-xs text-[var(--mute)] mt-1">{c.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {c.isActive ? (
                <span className="st active text-xs">
                  <i />
                  সক্রিয়
                </span>
              ) : (
                <span className="st draft text-xs">
                  <i />
                  নিষ্ক্রিয়
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <p className="text-xs text-[var(--mute)] mb-0.5">ছাড়</p>
              <p className="font-semibold">{fmtDiscount(c.type, c.value)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--mute)] mb-0.5">ন্যূনতম অর্ডার</p>
              <p className="font-semibold">
                {c.minOrderAmount > 0 ? `BDT ${c.minOrderAmount}` : "নেই"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--mute)] mb-0.5">ব্যবহার</p>
              <p className="font-semibold">
                {c.usedCount}
                {c.maxUses !== null && (
                  <span className="text-[var(--mute)] font-normal">
                    {" / "}
                    {c.maxUses}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--mute)] mb-0.5">মেয়াদ</p>
              <p className="font-semibold">{fmtDate(c.expiresAt)}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--line)]">
            <CouponActionButtons coupon={c} onEdit={onEdit} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Manager ─────────────────────────────────────────────────────────────

export default function CouponsManager({ coupons }: { coupons: CouponRow[] }) {
  const [modal, setModal] = useState<null | "create" | CouponRow>(null);

  function handleClose() {
    setModal(null);
  }

  return (
    <>
      {/* Create button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          className="btn-solid inline-flex items-center gap-2"
          onClick={() => setModal("create")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          নতুন কুপন
        </button>
      </div>

      <CouponsTable
        coupons={coupons}
        onEdit={(c) => setModal(c)}
      />
      <CouponsMobileCards
        coupons={coupons}
        onEdit={(c) => setModal(c)}
      />

      {modal !== null && (
        <CouponFormModal
          editing={modal === "create" ? null : modal}
          onClose={handleClose}
        />
      )}
    </>
  );
}
