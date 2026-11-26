"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCurrency } from "@/app/context/CurrencyProvider";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export interface OrderInfo {
  id: string;
  orderNumber: string;
  items: Array<{
    name: string;
    image: string;
    size?: string;
    color?: string;
    quantity: number;
    totalPrice: number;
  }>;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  paymentAmount: number;
  paymentMethod: "cod" | "online";
  customerName: string;
  payment: {
    status: string;
    transactionId?: string;
  };
}

interface Props {
  order: OrderInfo;
  token: string;
}

// ── Inner form (must be inside <Elements>) ───────────────────────────────────
function StripePaymentForm({
  orderId,
  token,
  returnUrl,
}: {
  orderId: string;
  token: string;
  returnUrl: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // If we get here, the redirect did NOT happen — there was an error
    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          ⚠ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full h-[52px] rounded-2xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx={12}
                cy={12}
                r={10}
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing…
          </>
        ) : (
          "Pay now"
        )}
      </button>

      <p className="text-xs text-[var(--mute)] text-center flex items-center justify-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <rect x={3} y={11} width={18} height={11} rx={2} />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secured by Stripe · Your card info is never stored on our servers
      </p>
    </form>
  );
}

// ── Loader: fetches client secret then mounts Elements ───────────────────────
function StripeLoader({
  orderId,
  token,
  returnUrl,
}: {
  orderId: string;
  token: string;
  returnUrl: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/stripe/intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-guest-token": token } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setFetchError(data.error ?? "Could not initialize payment.");
        }
      })
      .catch(() => setFetchError("Network error. Please refresh and try again."));
  }, [orderId, token]);

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        ⚠ {fetchError}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 flex items-center justify-center gap-3 text-[var(--mute)] text-sm">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading payment form…
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1a1a1a",
            colorBackground: "#ffffff",
            colorText: "#1a1a1a",
            colorDanger: "#df1b41",
            fontFamily: "system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "12px",
          },
        },
      }}
    >
      <StripePaymentForm orderId={orderId} token={token} returnUrl={returnUrl} />
    </Elements>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function PaymentClient({ order, token }: Props) {
  const { fmt } = useCurrency();

  const isPaid = order.payment.status === "paid";
  const isProcessing = order.payment.status === "processing";

  // Build return URL for after Stripe redirect
  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/payment/result?orderId=${order.id}${token ? `&token=${token}` : ""}`
      : `/payment/result?orderId=${order.id}`;

  // ── Already paid ────────────────────────────────────────────────────────────
  if (isPaid) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 grid place-items-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-3xl mb-2">Payment confirmed!</h1>
        <p className="text-[var(--mute)] mb-1">
          Order: <span className="font-bold text-[var(--ink)]">{order.orderNumber}</span>
        </p>
        <p className="text-[var(--mute)] mb-8">
          Your payment has been verified. Your order is now being processed.
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

  // ── Processing (Stripe redirect already happened, waiting webhook) ──────────
  if (isProcessing) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 grid place-items-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5M12 16h.01" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-2">Payment pending…</h1>
        <p className="text-[var(--mute)] mb-1">
          Order: <span className="font-bold text-[var(--ink)]">{order.orderNumber}</span>
        </p>
        <p className="text-[var(--mute)] mb-8">
          We&apos;re confirming your payment. This usually takes a few seconds.
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

  // ── Payment form ─────────────────────────────────────────────────────────────
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-36 lg:pb-20">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--mute)] hover:text-[var(--ink)] mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 6 9 12l6 6" />
          </svg>
          Back to checkout
        </Link>
        <p className="text-xs font-semibold tracking-[.22em] uppercase text-[var(--mute)] mb-1 md:hidden">
          Step 3 / 3
        </p>
        <h1 className="font-display font-extrabold text-[2rem] sm:text-4xl lg:text-5xl tracking-tight leading-none">
          Payment
        </h1>
        <p className="text-[var(--mute)] mt-2 text-[15px]">
          {order.paymentMethod === "cod"
            ? "Pay the delivery charge upfront to confirm your cash-on-delivery order."
            : "Complete your payment to confirm the order."}
        </p>
        {order.paymentMethod === "cod" && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-sm">
            <svg className="w-4 h-4 text-[var(--ink)] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={9} />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <span>
              Product price is paid on delivery — pay only the delivery charge{" "}
              <b className="text-[var(--ink)]">{fmt(order.paymentAmount)}</b> now.
            </span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
        {/* Payment form card */}
        <section className="card p-5 sm:p-7">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x={2} y={5} width={20} height={14} rx={2} />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl leading-tight">Card payment</h2>
              <p className="text-sm text-[var(--mute)] mt-0.5">
                Pay securely with your credit or debit card
              </p>
            </div>
          </div>

          <StripeLoader
            orderId={order.id}
            token={token}
            returnUrl={returnUrl}
          />
        </section>

        {/* Order summary sidebar */}
        <aside className="lg:sticky lg:top-24 card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display font-bold text-xl">Order summary</h2>
            <span className="text-xs font-semibold tracking-wide text-[var(--mute)]">
              {order.orderNumber}
            </span>
          </div>

          <div className="summary-scroll space-y-3.5 pr-1 max-h-56 overflow-y-auto">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--soft)] shrink-0 relative">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-[var(--mute)]">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-[var(--mute)] mt-0.5">
                    × {item.quantity} = {fmt(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-4 pt-4 border-t border-[var(--line)] space-y-2.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mute)]">Subtotal</dt>
              <dd className="font-medium">{fmt(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--mute)]">Discount</dt>
                <dd className="font-medium text-green-700">−{fmt(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mute)]">Delivery</dt>
              <dd className="font-medium">{fmt(order.deliveryCharge)}</dd>
            </div>
            <div className="flex items-end justify-between gap-4 pt-3 border-t border-[var(--line)]">
              <dt className="font-bold">Total due</dt>
              <dd className="font-display font-extrabold text-[1.7rem] leading-none">
                {fmt(order.paymentAmount)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-[var(--mute)] text-center">
            Hello, <span className="font-semibold text-[var(--ink)]">{order.customerName}</span>
          </p>
        </aside>
      </div>
    </main>
  );
}
