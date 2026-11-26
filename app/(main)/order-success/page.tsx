import Link from "next/link";

export const metadata = {
  title: "Order Confirmed – Neeshanz",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: { order?: string };
}

export default function OrderSuccessPage({ searchParams }: Props) {
  const orderNumber = searchParams.order ?? "";

  return (
    <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 grid place-items-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-3xl mb-2">Order Successful!</h1>
      {orderNumber && (
        <p className="text-[var(--mute)] mb-1">
          Order Number:{" "}
          <span className="font-bold text-[var(--ink)]">{orderNumber}</span>
        </p>
      )}
      <p className="text-[var(--mute)] mb-8">
        Your order has been received. You will receive a confirmation shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center px-8 rounded-full border border-[var(--line)] font-semibold hover:bg-[var(--soft)] transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center px-8 rounded-full bg-[var(--ink)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
