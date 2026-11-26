"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import NewPasswordStep from "./NewPasswordStep";
import SuccessStep from "../../login/_component/SuccessStep";

type Step = "email" | "otp" | "new-password" | "success";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (step !== "success") return;
    router.replace("/");
  }, [step, router]);

  return (
    <>
      {step === "email" && (
        <EmailStep onSuccess={(e) => { setEmail(e); setStep("otp"); }} />
      )}
      {step === "otp" && (
        <OtpStep
          email={email}
          onSuccess={() => setStep("new-password")}
          onBack={() => setStep("email")}
        />
      )}
      {step === "new-password" && (
        <NewPasswordStep email={email} onSuccess={() => setStep("success")} />
      )}
      {step === "success" && <SuccessStep />}
    </>
  );
}
