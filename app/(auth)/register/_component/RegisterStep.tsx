"use client";

import { useState, useTransition } from "react";
import { sendRegisterOtp } from "@/db/actions/auth.action";
import PhoneInput from "./PhoneInput";

interface RegisterStepProps {
  onSuccess: (data: { name: string; email: string; phone: string; password: string }) => void;
}

export default function RegisterStep({ onSuccess }: RegisterStepProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+880");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isValid = name.trim().length >= 2 && email.includes("@") && phone.trim().length >= 6 && password.trim().length >= 8;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    setError("");
    startTransition(async () => {
      const fullPhone = `${dialCode}${phone}`;
      const result = await sendRegisterOtp(name, email, fullPhone, password);
      if (!result.success) { setError(result.error); return; }
      onSuccess({ name, email: result.data.email, phone: fullPhone, password });
    });
  }

  const inputStyle = {
    width: "100%", padding: "0 14px", height: "48px", borderRadius: "10px",
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
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>

      <h1 className="font-display font-extrabold text-[1.85rem] sm:text-[2.1rem] tracking-tight leading-none">
        Create account
      </h1>
      <p className="text-mute mt-2.5 mb-7 text-[15px]">
        Fill in your details to get started.
      </p>

      <label className="block mb-2 text-[13px] font-semibold tracking-[.01em]">Full Name</label>
      <input
        type="text" autoComplete="name" placeholder="Your full name" autoFocus
        value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
        style={inputStyle}
      />

      <label className="block mt-4 mb-2 text-[13px] font-semibold tracking-[.01em]">Email Address</label>
      <input
        type="email" autoComplete="email" placeholder="email@example.com"
        value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
        style={inputStyle}
      />

      <label className="block mt-4 mb-2 text-[13px] font-semibold tracking-[.01em]">Phone Number</label>
      <PhoneInput
        value={phone}
        onChange={(num, dial) => { setPhone(num); setDialCode(dial); setError(""); }}
      />

      <label className="block mt-4 mb-2 text-[13px] font-semibold tracking-[.01em]">Password</label>
      <div className="relative">
        <input
          type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="At least 6 characters"
          value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
          placeholder="At least 8 characters"
          style={{ ...inputStyle, paddingRight: "44px" }}
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

      <p className={`text-sm font-medium mt-2 min-h-5 ${error ? "text-red-500" : "text-mute"}`} role="alert">{error}</p>

      <button type="submit" className="btn-main mt-3" disabled={!isValid || isPending}>
        {isPending && <span className="spin" />}
        <span>{isPending ? "Sending code…" : "Continue"}</span>
      </button>

      <div className="relative flex items-center my-5">
        <div className="flex-1 border-t border-line" />
        <span className="mx-3 text-xs text-mute font-medium">OR</span>
        <div className="flex-1 border-t border-line" />
      </div>

      <a
        href="/api/auth/google"
        className="flex items-center justify-center gap-3 w-full rounded-xl border border-line px-4 py-3 text-[15px] font-semibold transition hover:bg-soft"
        style={{ color: "var(--ink)" }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
          <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.698H24.48v8.883h12.964c-.558 2.985-2.252 5.517-4.8 7.213v5.995h7.773c4.546-4.188 7.115-10.355 7.115-17.393z" fill="#4285F4"/>
          <path d="M24.48 48c6.502 0 11.953-2.154 15.937-5.853l-7.773-5.995c-2.154 1.44-4.909 2.291-8.164 2.291-6.277 0-11.59-4.24-13.491-9.937H3.016v6.19C6.981 42.898 15.147 48 24.48 48z" fill="#34A853"/>
          <path d="M10.989 28.506A14.33 14.33 0 0 1 10.24 24c0-1.566.27-3.082.749-4.506v-6.19H3.016A23.98 23.98 0 0 0 .48 24c0 3.868.927 7.527 2.536 10.696l7.973-6.19z" fill="#FBBC05"/>
          <path d="M24.48 9.557c3.535 0 6.707 1.215 9.202 3.6l6.902-6.902C36.425 2.39 30.98 0 24.48 0 15.147 0 6.981 5.102 3.016 13.304l7.973 6.19c1.9-5.697 7.214-9.937 13.491-9.937z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>

      <p className="text-sm text-mute text-center mt-5">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-ink hover:underline underline-offset-4">Sign In</a>
      </p>
    </form>
  );
}
