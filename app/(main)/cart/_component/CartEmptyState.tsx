import Link from "next/link";

export default function CartEmptyState() {
  return (
    <section className="card p-8 sm:p-14 text-center max-w-xl mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-soft grid place-items-center mx-auto mb-5">
        <svg
          className="w-9 h-9 text-mute"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
      </div>
      <h2 className="font-display font-extrabold text-2xl mb-2">
        আপনার কার্ট খালি
      </h2>
      <p className="text-mute mb-6">
        পছন্দের টি-শার্ট বা শার্ট যোগ করে আবার আসুন।
      </p>
      <Link
        href="/"
        className="inline-flex h-12 items-center px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90"
      >
        শপে যান
      </Link>
    </section>
  );
}
