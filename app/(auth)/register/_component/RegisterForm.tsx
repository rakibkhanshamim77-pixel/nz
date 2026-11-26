"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterStep from "./RegisterStep";
import EmailOtpStep from "./EmailOtpStep";
import SuccessStep from "../../login/_component/SuccessStep";

type Step = "register" | "otp" | "success";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("register");
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    if (step !== "success") return;
    router.replace("/");
  }, [step, router]);

  return (
    <>
      {step === "register" && (
        <RegisterStep
          onSuccess={(data) => { setFormData(data); setStep("otp"); }}
        />
      )}
      {step === "otp" && (
        <EmailOtpStep
          {...formData}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("register")}
        />
      )}
      {step === "success" && <SuccessStep />}
    </>
  );
}
