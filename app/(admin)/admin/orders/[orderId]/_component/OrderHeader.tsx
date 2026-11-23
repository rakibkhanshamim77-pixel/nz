import {
  STATUS_LABELS,
  STATUS_COLORS,
  PAYMENT_LABELS,
  PAYMENT_COLORS,
  fmtDate,
} from "./orderConstants";
import OrderHeaderActions from "./OrderHeaderActions";

interface Props {
  orderId: string;
  orderNumber: string;
  createdAt: Date | string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

export default function OrderHeader({
  orderId,
  orderNumber,
  createdAt,
  customerName,
  customerPhone,
  status,
  paymentStatus,
  totalAmount,
}: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5 pb-5 border-b border-[var(--line)]">
      <div className="min-w-0">
        <p className="text-xs text-[var(--mute)] font-semibold uppercase tracking-wider mb-1">
          Placed {fmtDate(createdAt)}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1 mb-1">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight">
            #{orderNumber}
          </h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              PAYMENT_COLORS[paymentStatus] ?? "bg-amber-100 text-amber-800"
            }`}
          >
            {PAYMENT_LABELS[paymentStatus] ?? paymentStatus}
          </span>
        </div>
        <p className="text-sm text-[var(--mute)]">
          {customerName} &nbsp;·&nbsp; {customerPhone}
        </p>
      </div>
      <OrderHeaderActions
        orderId={orderId}
        currentStatus={status}
        orderNumber={orderNumber}
        customerName={customerName}
        totalAmount={totalAmount}
      />
    </div>
  );
}
