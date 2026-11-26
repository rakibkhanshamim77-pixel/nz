"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginStep from "./PhoneStep";
import SuccessStep from "./SuccessStep";

export default function LoginForm() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    router.replace("/");
  }, [done, router]);

  if (done) return <SuccessStep />;
  return <LoginStep onSuccess={() => setDone(true)} />;
}
