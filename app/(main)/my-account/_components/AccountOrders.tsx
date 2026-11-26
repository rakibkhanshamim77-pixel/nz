"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AccountOrder } from "./account.types";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "./account.types";
import { useCurrency } from "@/app/context/CurrencyProvider";

const PAGE_SIZE = 6;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProductThumb({ image, name }: { image?: string; name: string }) {
  if (image) {
    return (
      <span className="w-12 h-14 rounded-xl overflow-hidden bg-soft shrink-0 inline-flex">
        <Image src={image} alt={name} width={48} height={56} className="object-cover w-full h-full" />
      </span>
    );
  }
  return (
    <span className="w-12 h-14 rounded-xl bg-soft grid place-items-center shrink-0">
      <svg className="w-6 h-6 text-mute" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </span>
  );
}

function PaymentLabel(method: string, gateway?: string): string {
  if (gateway && gateway !== "COD") return gateway;
  if (method === "cod") return "Cash on Delivery";
  return method;
}

export default function AccountOrders({ orders }: { orders: AccountOrder[] }) {
  const { fmt } = useCurrency();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paged = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggle(num: string) {
    setExpanded((prev) => (prev === num ? null : num));
  }

  function goPage(p: number) {
    setPage(p);
    setExpanded(null);
    // scroll to top of section smoothly
    document.getElementById("orders")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="orders" className="card p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl">My Orders</h2>
        {orders.length > 0 && (
          <span className="text-sm text-mute">
            {orders.length} orders total
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-mute text-sm">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
            <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
          </svg>
          No orders placed yet.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paged.map((order) => {
              const label = ORDER_STATUS_LABEL[order.status] ?? order.status;
              const color = ORDER_STATUS_COLOR[order.status] ?? "border-line text-mute";
              const isOpen = expanded === order.orderNumber;
              const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
              const isActive = ["pending", "confirmed", "processing", "shipped"].includes(order.status);

              return (
                <article key={order.orderNumber} className="rounded-2xl border border-line">
                  {/* Header row */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <b className="font-display text-lg tracking-wide">{order.orderNumber}</b>
                        <p className="text-xs text-mute">
                          {fmtDate(order.createdAt)} · {totalQty} pcs
                        </p>
                      </div>
                      <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-bold border ${color}`}>
                        {label}
                      </span>
                    </div>

                    {/* Thumbnails + total */}
                    <div className="flex items-center gap-2 mb-4">
                      {order.items.slice(0, 3).map((it, idx) => (
                        <ProductThumb key={idx} image={it.image} name={it.name} />
                      ))}
                      {order.items.length > 3 && (
                        <span className="w-12 h-14 rounded-xl bg-soft grid place-items-center text-xs font-semibold text-mute">
                          +{order.items.length - 3}
                        </span>
                      )}
                      <span className="ml-auto text-right">
                        <span className="block text-xs text-mute">Total</span>
                        <b className="font-display text-xl">{fmt(order.totalAmount)}</b>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(order.orderNumber)}
                        className="h-10 px-4 rounded-xl bg-ink text-bg text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                      >
                        {isOpen ? "Close" : "View Details"}
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          viewBox="0 0 24 24"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {isActive && (
                        <Link
                          href={`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`}
                          className="h-10 px-4 rounded-xl border border-line text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-soft transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx={11} cy={11} r={7} />
                            <path d="m20 20-3.5-3.5" />
                          </svg>
                          Track
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-line px-4 sm:px-5 py-4 space-y-4">
                      {/* Items */}
                      <div className="space-y-2 text-sm">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between gap-3">
                            <span>
                              {it.name}
                              {(it.color || it.size) && (
                                <span className="text-mute">
                                  {it.color ? ` · ${it.color}` : ""}
                                  {it.size ? ` · ${it.size}` : ""}
                                  {` × ${it.quantity}`}
                                </span>
                              )}
                            </span>
                            <b className="shrink-0">{fmt(it.totalPrice)}</b>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <dl className="text-sm space-y-1 pt-3 border-t border-line">
                        {order.deliveryCharge > 0 && (
                          <div className="flex justify-between gap-3 text-mute">
                            <dt>Delivery Charge</dt>
                            <dd>{fmt(order.deliveryCharge)}</dd>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div className="flex justify-between gap-3 text-mute">
                            <dt>Discount</dt>
                            <dd>-{fmt(order.discount)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-3 font-semibold pt-1">
                          <dt>Grand Total</dt>
                          <dd>{fmt(order.totalAmount)}</dd>
                        </div>
                      </dl>

                      {/* Payment + address */}
                      <div className="text-sm text-mute space-y-1 pt-3 border-t border-line">
                        <p>
                          Payment: {PaymentLabel(order.payment.method, order.payment.gateway)}
                          {order.payment.transactionId && (
                            <span className="ml-1 font-mono text-xs">{order.payment.transactionId}</span>
                          )}
                        </p>
                        {order.customer.address && (
                          <p>
                            {[order.customer.address, order.customer.district, order.customer.division]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Track link inside detail */}
                      {isActive && (
                        <div className="pt-1">
                          <Link
                            href={`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)] hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <circle cx={11} cy={11} r={7} />
                              <path d="m20 20-3.5-3.5" />
                            </svg>
                            Track Order →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-line">
              <button
                type="button"
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                className="h-9 px-4 rounded-xl border border-line text-sm font-medium inline-flex items-center gap-1.5 hover:bg-soft transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                      p === page
                        ? "bg-ink text-bg"
                        : "border border-line hover:bg-soft"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages}
                className="h-9 px-4 rounded-xl border border-line text-sm font-medium inline-flex items-center gap-1.5 hover:bg-soft transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
