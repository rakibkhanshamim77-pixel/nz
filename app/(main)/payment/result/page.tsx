"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

type Status = "loading" | "success" | "processing" | "failed";

function PaymentResult() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderId = params.get("orderId") ?? "";
  const paymentIntentId = params.get("payment_intent");
  const clientSecret = params.get("payment_intent_client_secret");

  useEffect(() => {
    if (!clientSecret) {
      setStatus("failed");
      setErrorMessage("No payment information found.");
      return;
    }

    stripePromise.then((stripe) => {
      if (!stripe) {
        setStatus("failed");
        return;
      }

      stripe
        .retrievePaymentIntent(clientSecret)
        .then(({ paymentIntent }) => {
          switch (paymentIntent?.status) {
            case "succeeded":
              // Sync order status server-side immediately (webhook may not have fired yet)
              fetch("/api/stripe/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentIntentId: paymentIntentId ?? paymentIntent.id,
                  orderId,
                }),
              }).catch(() => {});
              setStatus("success");
              break;
            case "processing":
              setStatus("processing");
              break;
            case "requires_payment_method":
              setStatus("failed");
              setErrorMessage("Payment was not completed. Please try again.");
              break;
            default:
              setStatus("failed");
              setErrorMessage("Something went wrong with your payment.");
          }
        })
        .catch(() => {
          setStatus("failed");
          setErrorMessage("Could not verify payment status.");
        });
    });
  }, [clientSecret, orderId, paymentIntentId]);

  if (status === "loading") {
    return (
      <main className="max-w-lg mx-auto px-4 pt-24 pb-32 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--soft)] grid place-items-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[var(--mute)] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-2">Verifying payment…</h1>
        <p className="text-[var(--mute)]">Please wait a moment.</p>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 grid place-items-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-3xl mb-2">Payment successful!</h1>
        <p className="text-[var(--mute)] mb-8">
          Your payment was confirmed. We&apos;re processing your order now.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center px-8 rounded-full border border-[var(--line)] font-semibold hover:bg-[var(--soft)] transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center px-8 rounded-full bg-[var(--ink)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  if (status === "processing") {
    return (
      <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 grid place-items-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5M12 16h.01" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-2">Payment pending</h1>
        <p className="text-[var(--mute)] mb-8">
          Your payment is being processed. We&apos;ll update your order once it&apos;s confirmed.
        </p>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center px-8 rounded-full border border-[var(--line)] font-semibold hover:bg-[var(--soft)] transition-colors"
        >
          Go home
        </Link>
      </main>
    );
  }

  // failed
  return (
    <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 grid place-items-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={9} />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-2xl mb-2">Payment failed</h1>
      <p className="text-[var(--mute)] mb-8">
        {errorMessage ?? "Your payment could not be completed."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link
            href={`/payment?orderId=${orderId}`}
            className="inline-flex h-12 items-center justify-center px-8 rounded-full bg-[var(--ink)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity"
          >
            Try again
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center px-8 rounded-full border border-[var(--line)] font-semibold hover:bg-[var(--soft)] transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense>
      <PaymentResult />
    </Suspense>
  );
}
