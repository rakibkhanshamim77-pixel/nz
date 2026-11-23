"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import SuccessStep from "./SuccessStep";

type Step = "phone" | "otp" | "success";

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (step !== "success") return;
    router.replace("/");
  }, [step, router]);

  function handlePhoneSuccess(normalizedPhone: string) {
    setPhone(normalizedPhone);
    setStep("otp");
  }

  return (
    <>
      {step === "phone" && <PhoneStep onSuccess={handlePhoneSuccess} />}
      {step === "otp" && (
        <OtpStep
          phone={phone}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("phone")}
        />
      )}
      {step === "success" && <SuccessStep />}
    </>
  );
}
