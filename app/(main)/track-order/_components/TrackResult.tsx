"use client";

import Image from "next/image";
import Link from "next/link";
import { TrackData, STATUS_STEP, STATUS_LABEL } from "./track.types";
import TrackProgressBar from "./TrackProgressBar";
import { useCurrency } from "@/app/context/CurrencyProvider";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long",
  });
}

interface Props {
  order: TrackData;
}

export default function TrackResult({ order }: Props) {
  const { fmt } = useCurrency();
  const status    = order.status;
  const cur       = STATUS_STEP[status] ?? 0;
  const cancelled = cur === -1;
  const pct       = cancelled ? 0 : Math.min(100, (Math.min(cur, 4) / 4) * 100);
  const label     = STATUS_LABEL[status] ?? status;
  const c         = order.customer;

  return (
    <div className="space-y-6">
      {/* ── Status card ── */}
      <section className="card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-mute mb-1">Order</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-wide">
              {order.orderNumber}
            </h2>
            <p className="text-sm text-mute mt-1">
              Order Date: {fmtDate(order.createdAt)}
            </p>
          </div>

          <span className={`inline-flex items-center gap-1.5 shrink-0 h-7 px-3 rounded-full text-xs font-bold border border-ink ${status === "delivered" ? "bg-ink text-bg" : ""}`}>
            {cancelled ? "✕" : status === "delivered" ? "✓" : "●"} {label}
          </span>
        </div>

        {cancelled ? (
          <div className="rounded-2xl border-2 border-ink p-4 text-sm font-medium">
            This order has been cancelled. For more details,{" "}
            <Link href="/" className="underline">contact us</Link>.
          </div>
        ) : (
          <TrackProgressBar currentStep={cur} percentage={pct} />
        )}

        {/* Courier info */}
        {order.delivery.courier && !cancelled && (
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-soft p-4">
              <p className="text-xs text-mute mb-1">Courier</p>
              <b>{order.delivery.courier}</b>
            </div>
            <div className="rounded-2xl bg-soft p-4">
              <p className="text-xs text-mute mb-1">Tracking Code</p>
              <b className="font-display tracking-wide">{order.delivery.trackingNumber || "—"}</b>
            </div>
            <div className="rounded-2xl bg-soft p-4">
              <p className="text-xs text-mute mb-1">Estimated Delivery</p>
              <b>{order.delivery.estimatedDeliveryAt ? fmtDay(order.delivery.estimatedDeliveryAt) : "—"}</b>
            </div>
          </div>
        )}
      </section>

      {/* ── Timeline + Details ── */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        {/* Activity timeline */}
        <section className="card p-5 sm:p-7">
          <h3 className="font-display font-bold text-xl mb-5">Order Updates</h3>
          <ol>
            {order.activities.map((ev, i) => (
              <li key={i} className="relative pl-7 pb-5 last:pb-0">
                <span className={`absolute left-[5px] top-2 w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-ink" : "bg-line"}`} />
                {i < order.activities.length - 1 && (
                  <span className="absolute left-[9px] top-[22px] bottom-[2px] w-[2px] bg-line" />
                )}
                <b className={`block text-[15px] ${i === 0 ? "" : "font-medium"}`}>{ev.title}</b>
                <span className="text-xs text-mute">{fmtDate(ev.createdAt)}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Order details */}
        <aside className="card p-5 sm:p-6">
          <h3 className="font-display font-bold text-xl mb-4">Order Details</h3>

          <div className="space-y-3.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 items-center min-w-0">
                <div className="w-14 h-16 rounded-xl grid place-items-center shrink-0 bg-soft overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={56} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-mute" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                      <rect x={3} y={3} width={18} height={18} rx={2} />
                      <circle cx={8.5} cy={8.5} r={1.5} />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <b className="block truncate text-sm">{item.name}</b>
                  <span className="text-xs text-mute">
                    {[item.color, item.size].filter(Boolean).join(" · ")}
                    {" · ×"}{item.quantity}
                  </span>
                </div>
                <b className="text-sm shrink-0">{fmt(item.totalPrice)}</b>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="mt-5 rounded-2xl bg-soft p-4 text-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-mute mb-1.5">Delivery Address</p>
            <b>{c.name}</b>
            <br />
            <span className="text-mute">
              {[c.address, c.upazila, c.district, c.division].filter(Boolean).join(", ")}
            </span>
          </div>

          {/* Totals */}
          <dl className="mt-4 pt-4 border-t border-line space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd>{fmt(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-mute">Discount</dt>
                <dd>−{fmt(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-mute">Delivery</dt>
              <dd>{order.deliveryCharge > 0 ? fmt(order.deliveryCharge) : "Free"}</dd>
            </div>
            {order.payment.transactionId && (
              <div className="flex justify-between gap-3 flex-wrap">
                <dt className="text-mute shrink-0">Payment</dt>
                <dd className="text-right min-w-0 break-all">
                  {order.payment.gateway || order.payment.method}
                  {" · "}
                  <span className="font-display tracking-wide">{order.payment.transactionId}</span>
                </dd>
              </div>
            )}
            <div className="flex justify-between items-end pt-3 border-t border-line">
              <dt className="font-bold">Grand Total</dt>
              <dd className="font-display font-extrabold text-2xl leading-none">{fmt(order.totalAmount)}</dd>
            </div>
          </dl>

          <Link
            href="/"
            className="mt-5 h-12 rounded-2xl border border-line font-semibold hover:bg-soft flex items-center justify-center transition-colors"
          >
            Get Help with This Order
          </Link>
        </aside>
      </div>
    </div>
  );
}
