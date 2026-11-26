import Link from "next/link";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PAYMENT_LABELS,
  PAYMENT_COLORS,
} from "./ordersConstants";
import { getCurrencySettings } from "@/db/settings.server";
import { formatPrice } from "@/db/settings";
import QuickStatusButton from "./QuickStatusButton";

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

interface OrderRow {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerDistrict?: string;
  itemCount: number;
  itemNames: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentGateway?: string;
  transactionId?: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const GATEWAY_ICONS: Record<string, string> = {
  bkash: "B",
  nagad: "N",
  rocket: "R",
};

export default async function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const currency = await getCurrencySettings();
  const fmt = (n: number) => formatPrice(n, currency);
  if (orders.length === 0) {
    return (
      <section className="card hidden md:block">
        <div className="py-20 text-center text-[var(--mute)]">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-30"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
            <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
          </svg>
          <p className="text-sm font-medium">No orders found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card hidden md:block mb-5">
      <div className="overflow-x-auto rounded-[24px]">
        <table className="ptbl w-full">
          <thead>
            <tr>
              <th>ORDER</th>
              <th>CUSTOMER</th>
              <th>ITEMS</th>
              <th className="text-right">TOTAL</th>
              <th>PAYMENT</th>
              <th>STATUS</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const nextStatus = NEXT_STATUS[order.status];
              const gatewayIcon =
                order.paymentGateway
                  ? (GATEWAY_ICONS[order.paymentGateway] ??
                    order.paymentGateway[0].toUpperCase())
                  : null;

              return (
                <tr key={order._id}>
                  <td>
                    <div>
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-display font-bold text-sm hover:underline underline-offset-2"
                      >
                        #{order.orderNumber}
                      </Link>
                      <p className="text-xs text-[var(--mute)] mt-0.5">
                        {fmtDate(order.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-semibold text-sm">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-[var(--mute)] font-mono">
                        {order.customerPhone}
                        {order.customerDistrict && ` · ${order.customerDistrict}`}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-sm line-clamp-1 max-w-[200px]">
                        {order.itemNames}
                      </p>
                      {order.itemCount > 1 && (
                        <p className="text-xs text-[var(--mute)] mt-0.5">
                          +{order.itemCount - 1} আরও
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {gatewayIcon && (
                        <span className="w-5 h-5 rounded-md bg-[var(--ink)] text-[var(--bg)] grid place-items-center text-[10px] font-extrabold font-display shrink-0">
                          {gatewayIcon}
                        </span>
                      )}
                      <span className="font-display font-bold text-sm">
                        {fmt(order.totalAmount)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          PAYMENT_COLORS[order.paymentStatus] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {PAYMENT_LABELS[order.paymentStatus] ??
                          order.paymentStatus}
                      </span>
                      {order.transactionId && (
                        <p className="text-xs text-[var(--mute)] mt-0.5 font-mono uppercase">
                          {order.transactionId.slice(0, 10)}
                        </p>
                      )}
                      {!order.transactionId && (
                        <p className="text-xs text-[var(--mute)] mt-0.5 capitalize">
                          {order.paymentMethod === "cod"
                            ? "COD"
                            : (order.paymentGateway ?? "Online")}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {nextStatus && (
                        <QuickStatusButton
                          orderId={order._id}
                          nextStatus={nextStatus}
                        />
                      )}
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="btn-ghost !h-8 !px-3 !rounded-[10px] text-xs inline-flex"
                        aria-label="View order"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle cx={12} cy={12} r={3} />
                          <path d="M2 12C2 12 5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
