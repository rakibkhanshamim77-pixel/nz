"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import SuccessStep from "./SuccessStep";
import GooglePhoneStep from "./GooglePhoneStep";
import type { PendingGoogleUser } from "@/app/utils/googleAuth";

type Step = "phone" | "otp" | "google-phone" | "success";

interface LoginFormProps {
  googleEnabled?: boolean;
  /** Signed-in Google account that still needs a phone number */
  pendingGoogle?: PendingGoogleUser | null;
  /** Error message from a failed Google sign-in */
  googleError?: string;
}

export default function LoginForm({ googleEnabled = false, pendingGoogle = null, googleError = "" }: LoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(pendingGoogle ? "google-phone" : "phone");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (step !== "success") return;
    router.replace("/");
    router.refresh();
  }, [step, router]);

  function handlePhoneSuccess(normalizedPhone: string) {
    setPhone(normalizedPhone);
    setStep("otp");
  }

  return (
    <>
      {step === "phone" && (
        <PhoneStep onSuccess={handlePhoneSuccess} googleEnabled={googleEnabled} initialError={googleError} />
      )}
      {step === "otp" && (
        <OtpStep
          phone={phone}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("phone")}
        />
      )}
      {step === "google-phone" && pendingGoogle && (
        <GooglePhoneStep
          google={pendingGoogle}
          onSuccess={() => setStep("success")}
          onCancel={() => {
            setStep("phone");
            router.replace("/login");
          }}
        />
      )}
      {step === "success" && <SuccessStep />}
    </>
  );
}
