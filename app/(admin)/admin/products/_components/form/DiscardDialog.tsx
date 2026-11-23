"use client";

import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function DiscardDialog({ open, onStay, onLeave }: Props) {
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
        aria-labelledby="discard-title"
        aria-describedby="discard-text"
      >
        <h2 id="discard-title" className="font-display font-extrabold text-2xl tracking-tight mb-2">
          Discard changes?
        </h2>
        <p id="discard-text" className="text-[15px] text-[var(--mute)] leading-relaxed">
          You have unsaved changes on this product. If you leave now they will be lost.
        </p>
        <div className="flex gap-3 mt-6">
          <button ref={stayBtn} type="button" className="btn-ghost flex-1 justify-center" onClick={onStay}>
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
