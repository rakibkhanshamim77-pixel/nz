"use client";

import { useState, useTransition } from "react";
import { cancelGoogleSignup, completeGoogleSignup } from "@/db/actions/auth.action";
import { BD_PHONE_REGEX } from "@/app/utils/phone";
import type { PendingGoogleUser } from "@/app/utils/googleAuth";

interface Props {
  google: PendingGoogleUser;
  onSuccess: () => void;
  onCancel: () => void;
}

/** Shown after a successful Google sign-in when the account has no phone number yet. No OTP. */
export default function GooglePhoneStep({ google, onSuccess, onCancel }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isValid = BD_PHONE_REGEX.test(phone);
  const first = Array.from((google.name || google.email || "?").trim())[0]?.toUpperCase();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    setError("");
    startTransition(async () => {
      const result = await completeGoogleSignup(phone);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelGoogleSignup();
      onCancel();
    });
  }

  return (
    <form className="step" onSubmit={handleSubmit} noValidate>
      {/* Signed-in Google account */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-soft mb-6 min-w-0">
        {google.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={google.picture}
            alt=""
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <span className="w-10 h-10 rounded-full bg-ink text-bg grid place-items-center font-bold shrink-0">
            {first}
          </span>
        )}
        <span className="min-w-0">
          <b className="block text-sm truncate">{google.name || "Google অ্যাকাউন্ট"}</b>
          {google.email && <span className="block text-xs text-mute truncate">{google.email}</span>}
        </span>
        <svg className="w-5 h-5 ml-auto shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-label="Google লগইন সফল">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </div>

      <h1 className="font-display font-extrabold text-[1.6rem] sm:text-[2rem] tracking-tight leading-tight">
        মোবাইল নম্বর দিন
      </h1>
      <p className="text-mute mt-2.5 mb-7 text-[15px]">
        অর্ডার ও ডেলিভারির আপডেট পেতে আপনার মোবাইল নম্বরটি দিন। কোনো OTP লাগবে না।
      </p>

      <label htmlFor="gphone" className="block mb-2 text-[13px] font-semibold tracking-[.01em]">
        মোবাইল নম্বর
      </label>
      <div className={`phone-box${error ? " err" : ""}`}>
        <span className="flex items-center gap-2 pl-4 pr-3 h-full border-r border-line text-[15px] font-semibold shrink-0">
          +88
        </span>
        <input
          id="gphone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={14}
          placeholder="01XXXXXXXXX"
          aria-describedby="gphoneErr"
          autoFocus
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
        />
      </div>
      <p id="gphoneErr" className="text-sm text-ink font-medium mt-2 min-h-5" role="alert">
        {error}
      </p>

      <button type="submit" className="btn-main mt-3" disabled={!isValid || isPending}>
        {isPending && <span className="spin" />}
        <span>{isPending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করে চালিয়ে যান"}</span>
      </button>

      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="w-full mt-4 text-sm text-mute hover:text-ink underline underline-offset-2 disabled:opacity-50"
      >
        বাতিল করে মোবাইল নম্বর ও OTP দিয়ে লগইন করুন
      </button>
    </form>
  );
}
