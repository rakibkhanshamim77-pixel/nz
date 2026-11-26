import Link from "next/link";
import type { AccountStats } from "./account.types";
import { getCurrencySettings } from "@/db/settings.server";
import { formatPrice } from "@/db/settings";

export default async function AccountDashboard({ stats }: { stats: AccountStats }) {
  const currency = await getCurrencySettings();
  const cards = [
    { label: "Total Orders",   value: String(stats.totalOrders) },
    { label: "Active Orders",  value: String(stats.activeOrders) },
    { label: "Items Bought",   value: String(stats.totalItems) },
    { label: "Total Spent",    value: formatPrice(stats.totalSpent, currency) },
  ];

  return (
    <section id="dashboard" className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((item) => (
          <div className="card p-3 sm:p-5" key={item.label}>
            <p className="text-[10px] sm:text-sm text-mute mb-1 sm:mb-2 leading-tight">{item.label}</p>
            <b className="font-display font-extrabold text-xl sm:text-3xl tracking-tight">
              {item.value}
            </b>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Link href="/shop" className="card p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 hover:border-[var(--ink)] transition-colors text-center sm:text-left">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" />
              <path d="M9 7V6a3 3 0 0 1 6 0v1" />
            </svg>
          </span>
          <b className="text-xs sm:text-base leading-tight">Shop Now</b>
        </Link>

        <Link href="/track-order" className="card p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 hover:border-[var(--ink)] transition-colors text-center sm:text-left">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
              <circle cx={7} cy={18} r="1.6" />
              <circle cx={18} cy={18} r="1.6" />
            </svg>
          </span>
          <b className="text-xs sm:text-base leading-tight">Track Order</b>
        </Link>

        <Link href="/contact" className="card p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 hover:border-[var(--ink)] transition-colors text-center sm:text-left">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-soft grid place-items-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
            </svg>
          </span>
          <b className="text-xs sm:text-base leading-tight">Help</b>
        </Link>
      </div>
    </section>
  );
}
