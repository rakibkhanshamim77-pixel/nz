"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { verifyOtp, requestOtp } from "@/db/actions/auth.action";

const RESEND_COOLDOWN = 60; // seconds — matches OTP_RESEND_COOLDOWN_SECONDS

interface OtpStepProps {
  phone: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function OtpStep({ phone, onSuccess, onBack }: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const code = digits.join("");
  const isComplete = code.length === 6;

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || isPending) return;
    setError("");
    startTransition(async () => {
      const result = await verifyOtp(phone, code);
      if (!result.success) {
        setError(result.error);
        setDigits(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }
      onSuccess();
    });
  }

  function handleResend() {
    setError("");
    setDigits(Array(6).fill(""));
    setTimer(RESEND_COOLDOWN);
    startTransition(async () => {
      const result = await requestOtp(phone);
      if (!result.success) {
        setError(result.error);
        return;
      }
      inputRefs.current[0]?.focus();
    });
  }

  return (
    <form id="otpStep" className="step" onSubmit={handleSubmit} noValidate>
      <button
        id="backBtn"
        type="button"
        className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink mb-5"
        onClick={onBack}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M15 6 9 12l6 6" />
        </svg>
        Change Number
      </button>
      <h1 className="font-display font-extrabold text-[1.85rem] sm:text-[2.1rem] tracking-tight leading-none">
        Verify OTP
      </h1>
      <p className="text-mute mt-2.5 mb-6 text-[15px]">
        Enter the 6-digit code sent to{" "}
        <b className="text-ink font-semibold">{phone}</b>.
      </p>
      <fieldset>
        <legend className="sr-only">6-digit OTP code</legend>
        <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxLength={2}
              value={digit}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              autoFocus={i === 0}
              className={`otp${digit ? " filled" : ""}${error ? " err" : ""}`}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>
      </fieldset>
      <p
        id="otpErr"
        className="text-sm text-ink font-medium mt-3 min-h-5"
        role="alert"
      >
        {error}
      </p>
      <button
        id="verifyBtn"
        type="submit"
        className="btn-main mt-2"
        disabled={!isComplete || isPending}
      >
        {isPending && <span className="spin" />}
        <span>{isPending ? "Verifying…" : "Verify"}</span>
      </button>
      <div className="text-center text-sm mt-5">
        {timer > 0 ? (
          <span className="text-mute">Resend in {timer} seconds</span>
        ) : (
          <button
            id="resendBtn"
            type="button"
            className="font-semibold text-ink hover:underline underline-offset-4"
            onClick={handleResend}
            disabled={isPending}
          >
            Resend Code
          </button>
        )}
      </div>
    </form>
  );
}
