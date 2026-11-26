"use server";

import dbConnect from "@/db/connect/dbConnect";
import Coupon from "@/db/models/Coupon";

export type CouponValidateResult =
  | {
      ok: true;
      code: string;
      type: "percentage" | "fixed";
      value: number;
      discountAmount: number;
      description?: string;
    }
  | { ok: false; error: string };

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponValidateResult> {
  if (!code?.trim()) return { ok: false, error: "কুপন কোড দিন" };

  await dbConnect();

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
  }).lean();

  if (!coupon) return { ok: false, error: "কুপন কোড সঠিক নয়" };
  if (!coupon.isActive) return { ok: false, error: "কুপনটি সক্রিয় নেই" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return { ok: false, error: "কুপনের মেয়াদ শেষ হয়েছে" };
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
    return { ok: false, error: "কুপনের ব্যবহার সীমা শেষ" };
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount)
    return {
      ok: false,
      error: `সর্বনিম্ন অর্ডার ৳${coupon.minOrderAmount} হতে হবে`,
    };

  const discountAmount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return {
    ok: true,
    code: coupon.code,
    type: coupon.type as "percentage" | "fixed",
    value: coupon.value,
    discountAmount,
    description: coupon.description as string | undefined,
  };
}
