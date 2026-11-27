"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import {
  subscribeNewsletter,
  type NewsletterState,
} from "@/db/actions/news-letter.action";

const initialState: NewsletterState = { status: "idle", message: "" };

/** Must live inside the <form> so useFormStatus can read its pending state */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-ink text-bg font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-25"
          />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {pending ? "সাবমিট হচ্ছে..." : "সাবস্ক্রাইব করুন"}
    </button>
  );
}

interface NewsLetterProps {
  title?: string;
  description?: string;
}

export default function NewsLetter({
  title = "নতুন কালেকশনের খবর আগে পান",
  description = "ইমেইল দিন, প্রথম অর্ডারে ১০% ছাড়ের কোড পাবেন।",
}: NewsLetterProps) {
  const [state, formAction] = useFormState(subscribeNewsletter, initialState);
  const [email, setEmail] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // Clear the input after a successful subscription; show the latest result
  useEffect(() => {
    if (state.status === "idle") return;
    setShowMessage(true);
    if (state.status === "success") setEmail("");
  }, [state]);

  const isError = showMessage && state.status === "error";
  const isSuccess = showMessage && state.status === "success";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl bg-soft p-8 lg:p-12 grid lg:grid-cols-2 gap-6 items-center"
      >
        <div>
          <h2 className="font-display font-extrabold text-3xl mb-2">
            {title}
          </h2>
          <p className="text-mute">{description}</p>
        </div>

        <div>
          <form
            action={formAction}
            className="relative flex flex-col sm:flex-row gap-3"
          >
            {/* Honeypot — hidden from people and screen readers, catches simple bots */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              aria-label="Email"
              aria-invalid={isError || undefined}
              aria-describedby="newsletter-message"
              placeholder="আপনার ইমেইল"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (showMessage) setShowMessage(false);
              }}
              className={`flex-1 h-12 px-5 rounded-xl bg-bg border outline-none transition-colors focus:border-wine ${
                isError ? "border-red-500" : "border-line"
              }`}
            />

            <SubmitButton />
          </form>

          {/* Result message (announced to screen readers) */}
          <div
            id="newsletter-message"
            aria-live="polite"
            role="status"
            className="min-h-[1.5rem]"
          >
            {(isSuccess || isError) && (
              <p
                className={`mt-3 inline-flex items-start gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                  isSuccess
                    ? "bg-teal/10 text-teal"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                <span aria-hidden="true">{isSuccess ? "✓" : "!"}</span>
                {state.message}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
