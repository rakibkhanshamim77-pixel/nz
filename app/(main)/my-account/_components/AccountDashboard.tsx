import Link from "next/link";
import type { AccountStats } from "./account.types";

function fmt(n: number) {
  return "৳" + Math.round(n).toLocaleString("en-US");
}

export default function AccountDashboard({ stats }: { stats: AccountStats }) {
  const cards = [
    { label: "মোট অর্ডার",   value: String(stats.totalOrders) },
    { label: "চলমান অর্ডার", value: String(stats.activeOrders) },
    { label: "কেনা পিস",     value: String(stats.totalItems) },
    { label: "মোট খরচ",     value: fmt(stats.totalSpent) },
  ];

  return (
    <section id="dashboard" className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((item) => (
          <div className="card p-4 sm:p-5" key={item.label}>
            <p className="text-xs sm:text-sm text-mute mb-2">{item.label}</p>
            <b className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              {item.value}
            </b>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <Link href="/shop" className="card p-5 flex items-center gap-3 hover:border-[var(--ink)] transition-colors">
          <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" />
              <path d="M9 7V6a3 3 0 0 1 6 0v1" />
            </svg>
          </span>
          <b>কেনাকাটা করুন</b>
        </Link>

        <Link href="/track-order" className="card p-5 flex items-center gap-3 hover:border-[var(--ink)] transition-colors">
          <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
              <circle cx={7} cy={18} r="1.6" />
              <circle cx={18} cy={18} r="1.6" />
            </svg>
          </span>
          <b>অর্ডার ট্র্যাক</b>
        </Link>

        <Link href="/contact" className="card p-5 flex items-center gap-3 hover:border-[var(--ink)] transition-colors">
          <span className="w-10 h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
            </svg>
          </span>
          <b>সাহায্য</b>
        </Link>
      </div>
    </section>
  );
}
