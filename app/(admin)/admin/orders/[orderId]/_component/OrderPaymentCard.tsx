import { fmt, PAYMENT_LABELS, PAYMENT_COLORS } from "./orderConstants";
import AdminPaymentActions from "./AdminPaymentActions";

interface PaymentInfo {
  method: string;
  status: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  instructions?: string;
  // Online-only fields
  gateway?: string;
  transactionId?: string;
  senderAccount?: string;
  receiverNumber?: string;
  screenshotDisplayUrl?: string;
  screenshotUrl?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface Props {
  orderId: string;
  payment: PaymentInfo;
  serializedPayment: {
    submittedAt?: string;
    verifiedAt?: string;
  };
}

const GATEWAY_ICONS: Record<string, string> = {
  bkash: "B",
  nagad: "N",
  rocket: "R",
};

export default function OrderPaymentCard({
  orderId,
  payment,
  serializedPayment,
}: Props) {
  const isOnline = payment.method === "online";

  return (
    <div className="space-y-5">
      {/* Payment info card */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Payment</h2>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
              PAYMENT_COLORS[payment.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {PAYMENT_LABELS[payment.status] ?? payment.status}
          </span>
        </div>

        {/* Gateway tile (online only) */}
        {isOnline && payment.gateway && (
          <div className="flex items-center gap-3 mb-4 p-3.5 rounded-2xl bg-[var(--soft)]">
            <span className="w-9 h-9 rounded-xl bg-[var(--ink)] text-[var(--bg)] grid place-items-center font-display font-extrabold text-base shrink-0">
              {GATEWAY_ICONS[payment.gateway] ??
                payment.gateway[0].toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--mute)]">Payment gateway</p>
              <b className="text-sm capitalize">{payment.gateway}</b>
            </div>
            <b className="font-display font-extrabold text-xl">
              {fmt(payment.amount)}
            </b>
          </div>
        )}

        <dl className="space-y-0 text-sm">
          <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--line)]">
            <dt className="text-[var(--mute)]">Method</dt>
            <dd className="font-semibold">
              {payment.method === "cod" ? "Cash on Delivery" : "Online"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--line)]">
            <dt className="text-[var(--mute)]">Amount</dt>
            <dd className="font-semibold">{fmt(payment.amount)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--line)]">
            <dt className="text-[var(--mute)]">Paid</dt>
            <dd className="font-semibold text-green-700">
              {fmt(payment.paidAmount)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-[var(--mute)]">Due</dt>
            <dd
              className={`font-bold ${payment.dueAmount > 0 ? "text-amber-700" : "text-green-700"}`}
            >
              {payment.dueAmount > 0 ? fmt(payment.dueAmount) : "Paid in full"}
            </dd>
          </div>
        </dl>

        {payment.instructions && (
          <p className="text-xs text-[var(--mute)] bg-[var(--soft)] p-3 rounded-xl mt-3 leading-relaxed">
            {payment.instructions}
          </p>
        )}
      </section>

      {/* Online payment verification */}
      {isOnline && (
        <section className="card p-5">
          <h2 className="font-display font-bold text-lg mb-4">
            Mobile Banking Verification
          </h2>
          <AdminPaymentActions
            orderId={orderId}
            payment={{
              gateway: payment.gateway,
              transactionId: payment.transactionId,
              senderAccount: payment.senderAccount,
              receiverNumber: payment.receiverNumber,
              amount: payment.amount,
              screenshotDisplayUrl: payment.screenshotDisplayUrl,
              screenshotUrl: payment.screenshotUrl,
              submittedAt: serializedPayment.submittedAt,
              status: payment.status,
              verifiedAt: serializedPayment.verifiedAt,
              rejectionReason: payment.rejectionReason,
            }}
          />
        </section>
      )}

    </div>
  );
}
