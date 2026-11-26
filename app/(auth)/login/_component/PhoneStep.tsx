"use client";

import { useState, useTransition } from "react";
import { requestOtp } from "@/db/actions/auth.action";
import { BD_PHONE_REGEX } from "@/app/utils/phone";
import GoogleButton from "./GoogleButton";

interface PhoneStepProps {
  onSuccess: (phone: string) => void;
  /** Show "Continue with Google" (only when Google login is configured on the server) */
  googleEnabled?: boolean;
  /** Error to show from a failed Google sign-in */
  initialError?: string;
}

export default function PhoneStep({ onSuccess, googleEnabled = false, initialError = "" }: PhoneStepProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(initialError);
  const [isPending, startTransition] = useTransition();

  const isValid = BD_PHONE_REGEX.test(phone);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    setError("");
    startTransition(async () => {
      const result = await requestOtp(phone);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess(result.data.phone);
    });
  }

  return (
    <form id="phoneStep" className="step" onSubmit={handleSubmit} noValidate>
      <div
        className="w-14 h-14 rounded-2xl grid place-items-center mb-6"
        style={{ background: "var(--soft)", color: "var(--ink)" }}
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <rect x={6} y="2.5" width={12} height={19} rx="2.5" />
          <path d="M10.5 18.5h3" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-[1.85rem] sm:text-[2.1rem] tracking-tight leading-none">
        লগইন করুন
      </h1>
      <p className="text-mute mt-2.5 mb-7 text-[15px]">
        আপনার মোবাইল নম্বর দিন, আমরা একটি ৬ সংখ্যার OTP কোড পাঠাব।
      </p>
      <label
        htmlFor="phone"
        className="block mb-2 text-[13px] font-semibold tracking-[.01em]"
      >
        মোবাইল নম্বর
      </label>
      <div className={`phone-box${error ? " err" : ""}`}>
        <span className="flex items-center gap-2 pl-4 pr-3 h-full border-r border-line text-[15px] font-semibold shrink-0">
          +88
        </span>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={14}
          placeholder="01XXXXXXXXX"
          aria-describedby="phoneErr"
          autoFocus
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
        />
      </div>
      <p
        id="phoneErr"
        className="text-sm text-ink font-medium mt-2 min-h-5"
        role="alert"
      >
        {error}
      </p>
      <button
        id="sendBtn"
        type="submit"
        className="btn-main mt-3"
        disabled={!isValid || isPending}
      >
        {isPending && <span className="spin" />}
        <span>{isPending ? "পাঠানো হচ্ছে…" : "OTP পাঠান"}</span>
      </button>
      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 my-5 text-xs text-mute" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            অথবা
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton />
        </>
      )}
      <p className="text-xs text-mute text-center mt-5 leading-relaxed">
        চালিয়ে গেলে আপনি আমাদের{" "}
        <a href="#" className="underline text-ink">
          শর্তাবলী
        </a>{" "}
        ও{" "}
        <a href="#" className="underline text-ink">
          প্রাইভেসি পলিসি
        </a>
        -তে সম্মত হচ্ছেন।
      </p>
    </form>
  );
}
