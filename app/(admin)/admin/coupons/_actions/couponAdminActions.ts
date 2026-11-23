"use server";

import dbConnect from "@/db/connect/dbConnect";
import Coupon from "@/db/models/Coupon";
import { guardPage } from "@/app/utils/authz";
import { revalidatePath } from "next/cache";

async function guardCoupons() {
  return guardPage("coupon_management");
}

export interface CouponInput {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  expiresAt: string | null;
  description: string;
  isActive: boolean;
}

function validateInput(
  input: CouponInput,
): { ok: false; error: string } | null {
  if (!input.code?.trim()) return { ok: false, error: "কোড প্রয়োজন" };
  if (!/^[A-Z0-9_-]+$/i.test(input.code.trim()))
    return { ok: false, error: "কোডে শুধু অক্ষর, সংখ্যা, _ ও - ব্যবহার করুন" };
  if (!["percentage", "fixed"].includes(input.type))
    return { ok: false, error: "ধরন নির্বাচন করুন" };
  if (!input.value || input.value <= 0)
    return { ok: false, error: "মান ০-এর বেশি হতে হবে" };
  if (input.type === "percentage" && input.value > 100)
    return { ok: false, error: "শতাংশ ১০০-এর বেশি হতে পারবে না" };
  return null;
}

export async function createCoupon(
  input: CouponInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardCoupons();
  const err = validateInput(input);
  if (err) return err;

  await dbConnect();

  try {
    await Coupon.create({
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount || 0,
      maxUses: input.maxUses || null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      description: input.description?.trim() || undefined,
      isActive: input.isActive,
    });
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000)
      return { ok: false, error: "এই কোডটি ইতিমধ্যে ব্যবহার হয়েছে" };
    return { ok: false, error: "কুপন তৈরি করতে ব্যর্থ" };
  }
}

export async function updateCoupon(
  id: string,
  input: CouponInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardCoupons();
  const err = validateInput(input);
  if (err) return err;

  await dbConnect();

  try {
    await Coupon.findByIdAndUpdate(id, {
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount || 0,
      maxUses: input.maxUses || null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      description: input.description?.trim() || undefined,
      isActive: input.isActive,
    });
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000)
      return { ok: false, error: "এই কোডটি ইতিমধ্যে ব্যবহার হয়েছে" };
    return { ok: false, error: "কুপন আপডেট করতে ব্যর্থ" };
  }
}

export async function deleteCoupon(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardCoupons();
  await dbConnect();
  await Coupon.findByIdAndDelete(id);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCouponActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardCoupons();
  await dbConnect();
  await Coupon.findByIdAndUpdate(id, { isActive });
  revalidatePath("/admin/coupons");
  return { ok: true };
}
