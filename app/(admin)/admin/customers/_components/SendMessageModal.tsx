"use client";

import { useState } from "react";
import { broadcastSms } from "@/db/actions/admin/broadcast.action";

interface Props {
  totalCustomers: number;
}

export default function SendMessageModal({ totalCustomers }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState("");

  function openModal() {
    setOpen(true);
    setMessage("");
    setResult(null);
    setError("");
  }

  function closeModal() {
    if (busy) return;
    setOpen(false);
  }

  async function handleSend() {
    if (!message.trim()) { setError("মেসেজ লিখুন।"); return; }
    setError("");
    setBusy(true);
    const res = await broadcastSms(message);
    setBusy(false);
    if (!res.success) {
      setError(res.error);
    } else {
      setResult(res.result);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openModal}
        className="btn-solid flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="m22 2-7 20-4-9-9-4 20-7z" />
        </svg>
        সকল কাস্টমারকে SMS পাঠান
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg bg-[var(--bg)] rounded-3xl shadow-2xl border border-[var(--line)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
              <div>
                <h2 className="font-display font-bold text-lg">কাস্টম SMS</h2>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  {totalCustomers} জন কাস্টমারকে SMS যাবে
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={busy}
                className="icon-btn !w-8 !h-8"
                aria-label="বন্ধ করুন"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {result ? (
                /* Success state */
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 grid place-items-center mx-auto">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">SMS পাঠানো সম্পন্ন!</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[var(--soft)] rounded-2xl p-3">
                      <p className="font-bold text-xl text-[var(--ink)]">{result.total}</p>
                      <p className="text-xs text-[var(--mute)]">মোট</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-3">
                      <p className="font-bold text-xl text-green-600">{result.sent}</p>
                      <p className="text-xs text-[var(--mute)]">সফল</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3">
                      <p className="font-bold text-xl text-red-500">{result.failed}</p>
                      <p className="text-xs text-[var(--mute)]">ব্যর্থ</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-solid w-full mt-2"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="field block">
                      <span className="lbl">মেসেজ লিখুন</span>
                      <textarea
                        rows={5}
                        className="inp"
                        style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
                        placeholder="আপনার কাস্টম মেসেজ এখানে লিখুন…"
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); setError(""); }}
                        maxLength={500}
                        disabled={busy}
                        autoFocus
                      />
                    </label>
                    <div className="flex justify-between mt-1">
                      <span />
                      <span className="text-xs text-[var(--mute)]">{message.length}/500</span>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 font-medium">⚠ {error}</p>
                  )}

                  {/* Warning */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M12 9v4M12 17h.01M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                    </svg>
                    <p className="text-xs text-amber-800 dark:text-amber-400">
                      এই মেসেজ <b>{totalCustomers} জন</b> কাস্টমারের কাছে পাঠানো হবে। পাঠানোর পর ফেরানো সম্ভব নয়।
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={busy}
                      className="btn-ghost flex-1"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={busy || !message.trim()}
                      className="btn-solid flex-1 disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {busy ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                          পাঠানো হচ্ছে…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="m22 2-7 20-4-9-9-4 20-7z" />
                          </svg>
                          SMS পাঠান
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
