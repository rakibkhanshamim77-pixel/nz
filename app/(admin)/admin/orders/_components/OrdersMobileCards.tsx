import Link from "next/link";
import {
  fmt,
  STATUS_LABELS,
  STATUS_COLORS,
  PAYMENT_LABELS,
  PAYMENT_COLORS,
} from "./ordersConstants";

interface OrderRow {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  itemNames: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentGateway?: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersMobileCards({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <section className="md:hidden py-16 text-center text-[var(--mute)]">
        <svg
          className="w-10 h-10 mx-auto mb-3 opacity-30"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </svg>
        <p className="text-sm font-medium">No orders found</p>
      </section>
    );
  }

  return (
    <section className="md:hidden grid gap-3 mb-5">
      {orders.map((order) => (
        <Link
          key={order._id}
          href={`/admin/orders/${order._id}`}
          className="card p-4 block hover:shadow-md transition-shadow"
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-display font-bold text-base">
                #{order.orderNumber}
              </p>
              <p className="text-xs text-[var(--mute)] mt-0.5">
                {fmtDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          {/* Customer */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-[var(--soft)] grid place-items-center font-display font-bold text-xs shrink-0">
              {order.customerName.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {order.customerName}
              </p>
              <p className="text-xs text-[var(--mute)] font-mono">
                {order.customerPhone}
              </p>
            </div>
          </div>

          {/* Items */}
          <p className="text-xs text-[var(--mute)] mb-3 line-clamp-1">
            {order.itemNames}
            {order.itemCount > 1 && ` (+${order.itemCount - 1})`}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--line)]">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                PAYMENT_COLORS[order.paymentStatus] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </span>
            <span className="font-display font-extrabold text-base">
              {fmt(order.totalAmount)}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
