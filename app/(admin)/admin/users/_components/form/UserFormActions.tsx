"use client";

import { useEffect, useRef } from "react";

export const USER_FORM_ID = "user-form";

interface Props {
  dirty: boolean;
  saving: boolean;
  progress: string;
  submitLabel: string;
  shake: boolean;
  onCancel: () => void;
}

/**
 * Sticky save bar. Separate from the products one because that component
 * hardcodes `form="product-form"`.
 */
export default function UserFormActions({
  dirty,
  saving,
  progress,
  submitLabel,
  shake,
  onCancel,
}: Props) {
  return (
    <div className="save-bar fixed bottom-0 right-0 left-0 lg:left-[264px] z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-3 max-w-[1400px] flex items-center gap-3">
        <p
          className="hidden sm:flex items-center gap-2 text-sm text-[var(--mute)] mr-auto"
          aria-live="polite"
        >
          <span
            className={`w-2 h-2 rounded-full ${dirty ? "bg-[var(--ink)]" : "bg-[var(--line)]"}`}
          />
          <span>{saving ? progress : dirty ? "Unsaved changes" : "No changes yet"}</span>
        </p>
        <button
          type="button"
          className="btn-ghost flex-1 sm:flex-none justify-center"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          form={USER_FORM_ID}
          disabled={saving}
          className={`btn-solid flex-[2] sm:flex-none justify-center sm:min-w-[170px] ${shake ? "shake" : ""}`}
        >
          {saving ? (
            <>
              <span className="spin" />
              <span className="sm:hidden">{progress}</span>
              <span className="hidden sm:inline">Saving…</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Same behaviour as the products DiscardDialog, but worded for accounts — that
 * component's copy says "this product" and takes no text props.
 */
export function UserDiscardDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const stayBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => stayBtn.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onStay();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onStay]);

  return (
    <div
      className={`dlg fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4 ${open ? "show" : ""}`}
      aria-hidden={!open}
      onClick={(e) => e.target === e.currentTarget && onStay()}
    >
      <div
        className="dlg-box w-full sm:max-w-[400px] rounded-t-3xl sm:rounded-3xl bg-[var(--bg)] border border-[var(--line)] p-6 sm:p-7 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="user-discard-title"
        aria-describedby="user-discard-text"
      >
        <h2
          id="user-discard-title"
          className="font-display font-extrabold text-2xl tracking-tight mb-2"
        >
          Discard changes?
        </h2>
        <p id="user-discard-text" className="text-[15px] text-[var(--mute)] leading-relaxed">
          You have unsaved changes to this account. If you leave now they will be lost.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            ref={stayBtn}
            type="button"
            className="btn-ghost flex-1 justify-center"
            onClick={onStay}
          >
            Keep editing
          </button>
          <button type="button" className="btn-solid flex-1 justify-center" onClick={onLeave}>
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
