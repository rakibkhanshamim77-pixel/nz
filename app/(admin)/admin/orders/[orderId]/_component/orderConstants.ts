export const STATUS_LABELS: Record<string, string> = {
  pending: "Payment pending",
  confirmed: "Confirmed",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  partially_paid: "Partial",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  partially_paid: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const PROGRESS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

export const TERMINAL_STATUSES = ["cancelled", "returned", "refunded"];

export function fmt(n: number) {
  return "৳" + n.toLocaleString("en-US");
}

export function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
