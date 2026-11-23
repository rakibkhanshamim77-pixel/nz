"use client";

import { useState } from "react";
import {
  sendMaintenanceOtp,
  enableMaintenance,
  disableMaintenance,
  updateMaintenanceMessage,
} from "@/db/actions/admin/maintenance.action";

interface Props {
  initialEnabled: boolean;
  initialMessage: string;
}

type Step = "idle" | "awaiting_otp" | "sending_otp";

export default function MaintenanceSection({ initialEnabled, initialMessage }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState(initialMessage);
  const [step, setStep] = useState<Step>("idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgSaved, setMsgSaved] = useState(false);

  async function handleRequestOtp() {
    setError("");
    setBusy(true);
    setStep("sending_otp");
    const res = await sendMaintenanceOtp();
    setBusy(false);
    if (!res.success) {
      setError(res.error);
      setStep("idle");
    } else {
      setStep("awaiting_otp");
    }
  }

  async function handleEnable() {
    if (!otp.trim()) { setError("OTP লিখুন।"); return; }
    setError("");
    setBusy(true);
    const res = await enableMaintenance(otp, message);
    setBusy(false);
    if (!res.success) {
      setError(res.error);
    } else {
      setEnabled(true);
      setStep("idle");
      setOtp("");
    }
  }

  async function handleDisable() {
    setError("");
    setBusy(true);
    const res = await disableMaintenance();
    setBusy(false);
    if (!res.success) {
      setError(res.error);
    } else {
      setEnabled(false);
    }
  }

  async function handleSaveMessage() {
    setError("");
    setBusy(true);
    const res = await updateMaintenanceMessage(message);
    setBusy(false);
    if (!res.success) {
      setError(res.error);
    } else {
      setMsgSaved(true);
      setTimeout(() => setMsgSaved(false), 2500);
    }
  }

  return (
    <section className="card p-6 border-2 border-dashed border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 9v4M12 17h.01M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            মেইনটেন্যান্স মোড
          </h2>
          <p className="text-sm text-[var(--mute)] mt-0.5">
            চালু করলে মূল সাইটে শুধু মেইনটেন্যান্স পেজ দেখাবে।
          </p>
        </div>

        {/* Status badge */}
        <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
          enabled
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
            : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
          {enabled ? "চালু আছে" : "বন্ধ আছে"}
        </span>
      </div>

      {/* Message field */}
      <div className="mb-5">
        <label className="field block">
          <span className="lbl">ভিজিটরদের জন্য মেসেজ</span>
          <textarea
            rows={3}
            className="inp"
            style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
            value={message}
            onChange={(e) => { setMessage(e.target.value); setMsgSaved(false); }}
            placeholder="রক্ষণাবেক্ষণ চলছে…"
          />
        </label>
        {enabled && (
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={handleSaveMessage}
              disabled={busy}
              className="btn-ghost !h-8 !px-4 !text-xs disabled:opacity-40"
            >
              {busy ? "সংরক্ষণ হচ্ছে…" : "মেসেজ সংরক্ষণ করুন"}
            </button>
            {msgSaved && <span className="text-xs text-green-600 font-medium">✓ সংরক্ষিত</span>}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 font-medium mb-4">⚠ {error}</p>
      )}

      {/* Actions */}
      {!enabled ? (
        step === "idle" ? (
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={busy}
            className="btn-solid !bg-orange-600 hover:!bg-orange-700 !border-orange-600 disabled:opacity-40 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 9v4M12 17h.01M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            {busy ? "OTP পাঠানো হচ্ছে…" : "মেইনটেন্যান্স চালু করুন"}
          </button>
        ) : step === "sending_otp" ? (
          <p className="text-sm text-[var(--mute)]">OTP পাঠানো হচ্ছে…</p>
        ) : (
          /* OTP verification step */
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold">আপনার ফোনে পাঠানো OTP দিন</p>
            <p className="text-xs text-[var(--mute)]">
              আপনার রেজিস্টার্ড নম্বরে ৬ সংখ্যার কোড পাঠানো হয়েছে।
            </p>
            <div className="flex items-center gap-3">
              <input
                className="inp !w-40 !h-11 text-center tracking-widest font-mono text-lg"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleEnable}
                disabled={busy || otp.length !== 6}
                className="btn-solid !bg-orange-600 hover:!bg-orange-700 !border-orange-600 disabled:opacity-40"
              >
                {busy ? "যাচাই হচ্ছে…" : "নিশ্চিত করুন"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("idle"); setOtp(""); setError(""); }}
                className="btn-ghost !h-9 !px-3 !text-xs"
              >
                বাতিল
              </button>
            </div>
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={busy}
              className="text-xs text-[var(--mute)] hover:text-[var(--ink)] underline"
            >
              আবার OTP পাঠান
            </button>
          </div>
        )
      ) : (
        <button
          type="button"
          onClick={handleDisable}
          disabled={busy}
          className="btn-ghost !border-green-600 !text-green-700 hover:!bg-green-50 dark:hover:!bg-green-950/30 disabled:opacity-40 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m5 12 5 5L20 7" />
          </svg>
          {busy ? "বন্ধ হচ্ছে…" : "মেইনটেন্যান্স বন্ধ করুন"}
        </button>
      )}
    </section>
  );
}
