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
    if (!otp.trim()) { setError("Please enter the OTP."); return; }
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
    <section className={`rounded-2xl border-2 overflow-hidden transition-colors ${
      enabled
        ? "border-orange-400 dark:border-orange-700"
        : "border-[var(--line)]"
    }`}>
      {/* Top status bar */}
      <div className={`px-6 py-3 flex items-center justify-between gap-3 ${
        enabled
          ? "bg-orange-500 dark:bg-orange-700"
          : "bg-[var(--soft)] dark:bg-[var(--surface)]"
      }`}>
        <div className="flex items-center gap-2">
          {enabled ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M12 9v4M12 17h.01M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={10} /><path d="m4.9 4.9 14.2 14.2" />
            </svg>
          )}
          <span className={`text-xs font-bold uppercase tracking-widest ${enabled ? "text-white" : "text-[var(--mute)]"}`}>
            Maintenance Mode
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
          enabled
            ? "bg-white/20 text-white"
            : "bg-[var(--line)] text-[var(--mute)]"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-white animate-pulse" : "bg-[var(--mute)]"}`} />
          {enabled ? "Active" : "Off"}
        </span>
      </div>

      {/* Body */}
      <div className={`p-6 ${enabled ? "bg-orange-50/60 dark:bg-orange-950/20" : "bg-[var(--bg)]"}`}>
        {/* Description */}
        <p className="text-sm text-[var(--mute)] mb-5">
          When enabled, visitors see only the maintenance page. OTP confirmation is required to prevent accidental activation.
        </p>

        {/* Message field */}
        <div className="mb-5">
          <label className="field block">
            <span className="lbl">Visitor message</span>
            <textarea
              rows={3}
              className="inp"
              style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setMsgSaved(false); }}
              placeholder="We're currently under maintenance. We'll be back shortly."
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
                {busy ? "Saving…" : "Save message"}
              </button>
              {msgSaved && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-medium mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={10} /><path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        {!enabled ? (
          step === "idle" ? (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={busy}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 hover:border-orange-600 transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 9v4M12 17h.01M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
                {busy ? "Sending OTP…" : "Enable Maintenance"}
              </button>
              <p className="text-xs text-[var(--mute)]">An OTP will be sent to your registered email.</p>
            </div>
          ) : step === "sending_otp" ? (
            <div className="flex items-center gap-2 text-sm text-[var(--mute)]">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Sending OTP…
            </div>
          ) : (
            /* OTP verification step */
            <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-orange-950/10 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 grid place-items-center shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Verify with OTP</p>
                  <p className="text-xs text-[var(--mute)] mt-0.5">
                    A 6-digit code has been sent to your registered email.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <input
                  className="inp !w-44 !h-12 text-center tracking-[0.4em] font-mono text-xl"
                  maxLength={6}
                  placeholder="——————"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleEnable}
                  disabled={busy || otp.length !== 6}
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 disabled:opacity-40 transition-colors"
                >
                  {busy ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Verifying…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                      Confirm
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("idle"); setOtp(""); setError(""); }}
                  className="btn-ghost !h-12 !px-4 !text-sm"
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--mute)] hover:text-[var(--ink)] transition-colors disabled:opacity-40"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
                Resend OTP
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleDisable}
              disabled={busy}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-300 dark:border-green-700 transition-colors disabled:opacity-40"
            >
              {busy ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Disabling…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  Disable Maintenance
                </>
              )}
            </button>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Site is currently in maintenance mode — visitors cannot access it.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
