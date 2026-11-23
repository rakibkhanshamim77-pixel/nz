"use client";

import { TrackData, STATUS_LABEL, STATUS_COLOR } from "./track.types";

function fmt(n: number) {
  return "৳" + Math.round(n).toLocaleString("en-US");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface Props {
  orders: TrackData[];
  onSelect: (order: TrackData) => void;
}

export default function TrackOrderList({ orders, onSelect }: Props) {
  return (
    <div className="mt-6">
      <p className="text-sm text-mute mb-4">
        এই নম্বরে মোট{" "}
        <b className="text-ink">{orders.length}টি</b> অর্ডার পাওয়া গেছে।
      </p>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-soft border-b border-line">
              <th className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">অর্ডার নম্বর</th>
              <th className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">তারিখ</th>
              <th className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">পণ্য</th>
              <th className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">মোট</th>
              <th className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">স্ট্যাটাস</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => {
              const label = STATUS_LABEL[order.status] ?? order.status;
              const color = STATUS_COLOR[order.status] ?? "border-line text-mute";
              const itemNames = order.items.map(it => it.name).join(", ");
              const itemText  = itemNames.length > 40 ? itemNames.slice(0, 38) + "…" : itemNames;

              return (
                <tr
                  key={order.orderNumber}
                  className={`border-b border-line last:border-0 hover:bg-soft/60 transition-colors ${i % 2 === 0 ? "bg-bg" : "bg-surface"}`}
                >
                  <td className="px-5 py-4 font-mono font-bold text-ink tracking-wide whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-4 text-mute whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                  <td className="px-5 py-4 text-mute max-w-[220px]">
                    <span className="block truncate">{itemText}</span>
                    <span className="text-xs">{order.items.length}টি আইটেম</span>
                  </td>
                  <td className="px-5 py-4 font-semibold whitespace-nowrap">{fmt(order.totalAmount)}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-bold border ${color}`}>
                      {label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect(order)}
                      className="text-xs font-semibold text-ink underline underline-offset-2 hover:no-underline"
                    >
                      বিস্তারিত →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {orders.map((order) => {
          const label = STATUS_LABEL[order.status] ?? order.status;
          const color = STATUS_COLOR[order.status] ?? "border-line text-mute";
          const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);

          return (
            <div key={order.orderNumber} className="card p-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono font-bold text-ink tracking-wide text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-mute mt-0.5">{fmtDate(order.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-bold border shrink-0 ${color}`}>
                  {label}
                </span>
              </div>

              {/* Items summary */}
              <p className="text-sm text-mute mb-3 line-clamp-2">
                {order.items.map(it => it.name).join(", ")}
                <span className="ml-1 text-xs">({totalQty}টি)</span>
              </p>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-3 border-t border-line">
                <span className="font-bold text-sm">{fmt(order.totalAmount)}</span>
                <button
                  type="button"
                  onClick={() => onSelect(order)}
                  className="h-9 px-4 rounded-full bg-ink text-bg text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  বিস্তারিত দেখুন
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
