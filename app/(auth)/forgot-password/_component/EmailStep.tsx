"use client";

import { useState, useTransition } from "react";
import { sendPasswordResetOtp } from "@/db/actions/auth.action";

interface EmailStepProps {
  onSuccess: (email: string) => void;
}

export default function EmailStep({ onSuccess }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    setError("");
    startTransition(async () => {
      const result = await sendPasswordResetOtp(email);
      if (!result.success) { setError(result.error); return; }
      onSuccess(result.data.email);
    });
  }

  return (
    <form className="step" onSubmit={handleSubmit} noValidate>
      <div
        className="w-14 h-14 rounded-2xl grid place-items-center mb-6"
        style={{ background: "var(--soft)", color: "var(--ink)" }}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x={2} y={4} width={20} height={16} rx={2} />
          <path d="m2 7 10 7 10-7" />
        </svg>
      </div>

      <h1 className="font-display font-extrabold text-[1.85rem] sm:text-[2.1rem] tracking-tight leading-none">
        Forgot password?
      </h1>
      <p className="text-mute mt-2.5 mb-7 text-[15px]">
        Enter your email and we&apos;ll send a reset code.
      </p>

      <label htmlFor="email" className="block mb-2 text-[13px] font-semibold tracking-[.01em]">
        Email Address
      </label>
      <input
        id="email" type="email" autoComplete="email" placeholder="email@example.com" autoFocus
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
        style={{
          width: "100%", padding: "0 14px", height: "48px", borderRadius: "10px",
          border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)",
          fontSize: "15px", outline: "none", boxSizing: "border-box",
        }}
      />

      <p className={`text-sm font-medium mt-2 min-h-5 ${error ? "text-red-500" : "text-mute"}`} role="alert">
        {error}
      </p>

      <button type="submit" className="btn-main mt-3" disabled={!isValid || isPending}>
        {isPending && <span className="spin" />}
        <span>{isPending ? "Sending…" : "Send Reset Code"}</span>
      </button>

      <p className="text-sm text-mute text-center mt-5">
        <a href="/login" className="font-semibold text-ink hover:underline underline-offset-4">
          Back to Sign In
        </a>
      </p>
    </form>
  );
}
