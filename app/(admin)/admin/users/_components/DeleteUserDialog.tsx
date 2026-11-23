"use client";

import { useState, useEffect } from "react";
import type { UserRow } from "./types";

interface Props {
  user: UserRow | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  loading?: boolean;
}

export default function DeleteUserDialog({ user, onClose, onConfirm, loading }: Props) {
  const open = !!user;
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // The server refuses to delete an account that still has orders, so say so up
  // front instead of letting the confirmation fail.
  const hasOrders = (user?.orderCount ?? 0) > 0;
  const confirmed = typed.trim().toUpperCase() === "DELETE";
  const label = user?.name?.trim() || user?.phone || "This account";

  return (
    <div
      className={`dlg fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4 ${open ? "show" : ""}`}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dlg-box w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-3xl bg-[var(--bg)] border border-[var(--line)] p-6 sm:p-7 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="w-14 h-14 rounded-2xl bg-[var(--ink)] text-[var(--bg)] grid place-items-center mb-5">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </div>

        {hasOrders ? (
          <>
            <h2 className="font-display font-extrabold text-2xl tracking-tight mb-2">
              This account can&apos;t be deleted
            </h2>
            <p className="text-[15px] text-[var(--mute)] leading-relaxed">
              <b className="text-[var(--ink)]">{label}</b> has{" "}
              <b className="text-[var(--ink)]">{user?.orderCount}</b> order
              {user?.orderCount === 1 ? "" : "s"} attached. Deleting it would orphan that history —
              deactivate the account instead so it can no longer sign in.
            </p>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={onClose} className="btn-solid flex-1 justify-center">
                Got it
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display font-extrabold text-2xl tracking-tight mb-2">
              Delete this account?
            </h2>
            <p className="text-[15px] text-[var(--mute)] leading-relaxed">
              <b className="text-[var(--ink)]">{label}</b>{" "}
              (<span className="mono text-[13px]">{user?.phone}</span>) will be removed permanently.
              This can&apos;t be undone.
            </p>

            <label className="block mt-5">
              <span className="flbl">
                Type <b className="text-[var(--ink)] font-display tracking-wider">DELETE</b> to confirm
              </span>
              <input
                className="inp !h-11 text-sm mono"
                autoComplete="off"
                spellCheck={false}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="DELETE"
              />
            </label>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmed || loading}
                onClick={() => user && onConfirm(user.id)}
                className="btn-solid flex-1 justify-center"
              >
                {loading ? <span className="spin" /> : "Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
