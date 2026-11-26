export interface CouponRow {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  description: string | null;
  createdAt: string;
}

export const DEFAULT_LIMIT = 15;

export function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDiscount(type: "percentage" | "fixed", value: number) {
  return type === "percentage" ? `${value}% off` : `$${value} off`;
}
