"use client";

import { useState, useTransition } from "react";
import { resetPassword } from "@/db/actions/auth.action";

interface NewPasswordStepProps {
  email: string;
  onSuccess: () => void;
}

export default function NewPasswordStep({ email, onSuccess }: NewPasswordStepProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isValid = password.length >= 8 && password === confirm;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    startTransition(async () => {
      const result = await resetPassword(email, password);
      if (!result.success) { setError(result.error); return; }
      onSuccess();
    });
  }

  const inputStyle = {
    width: "100%", padding: "0 44px 0 14px", height: "48px", borderRadius: "10px",
    border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)",
    fontSize: "15px", outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <form className="step" onSubmit={handleSubmit} noValidate>
      <div
        className="w-14 h-14 rounded-2xl grid place-items-center mb-6"
        style={{ background: "var(--soft)", color: "var(--ink)" }}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x={5} y={11} width={14} height={10} rx={2} />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>

      <h1 className="font-display font-extrabold text-[1.85rem] sm:text-[2.1rem] tracking-tight leading-none">
        New password
      </h1>
      <p className="text-mute mt-2.5 mb-7 text-[15px]">
        Choose a strong password for your account.
      </p>

      <label className="block mb-2 text-[13px] font-semibold tracking-[.01em]">New Password</label>
      <div className="relative">
        <input
          type={showPass ? "text" : "password"} autoComplete="new-password"
          placeholder="At least 8 characters" autoFocus
          value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
          style={inputStyle}
        />
        <button
          type="button" onClick={() => setShowPass((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
          aria-label={showPass ? "Hide password" : "Show password"}
        >
          {showPass ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <label className="block mt-4 mb-2 text-[13px] font-semibold tracking-[.01em]">Confirm Password</label>
      <div className="relative">
        <input
          type={showPass ? "text" : "password"} autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(""); }}
          style={inputStyle}
        />
      </div>

      {password.length > 0 && confirm.length > 0 && password !== confirm && (
        <p className="text-sm text-red-500 font-medium mt-2">Passwords do not match.</p>
      )}

      <p className={`text-sm font-medium mt-2 min-h-5 ${error ? "text-red-500" : "text-mute"}`} role="alert">{error}</p>

      <button type="submit" className="btn-main mt-3" disabled={!isValid || isPending}>
        {isPending && <span className="spin" />}
        <span>{isPending ? "Saving…" : "Set New Password"}</span>
      </button>
    </form>
  );
}
