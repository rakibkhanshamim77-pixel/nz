"use server";

import dbConnect from "@/db/connect/dbConnect";
import Settings, { SETTINGS_KEY } from "@/db/models/Settings";
import Otp from "@/db/models/OTP";
import User from "@/db/models/User";
import { getCurrentUser } from "@/app/utils/authz";
import { sendOtp } from "@/app/lib/sms";
import { normalizeBDPhone } from "@/db/models/User";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}

/** Step 1: send OTP to the signed-in admin's phone. */
export async function sendMaintenanceOtp(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const user = await requireAdmin();
    await dbConnect();

    const dbUser = await User.findById(user.id).select("phone").lean();
    if (!dbUser || !(dbUser as { phone?: string }).phone) {
      return { success: false, error: "আপনার অ্যাকাউন্টে কোনো ফোন নম্বর নেই।" };
    }

    const phone = normalizeBDPhone((dbUser as { phone: string }).phone);
    const result = await Otp.issue(phone, "maintenance");

    if ("error" in result) {
      return {
        success: false,
        error: `আবার পাঠানোর আগে ${result.retryAfterSeconds} সেকেন্ড অপেক্ষা করুন।`,
      };
    }

    await sendOtp(phone, result.code);
    return { success: true };
  } catch (err) {
    console.error("[maintenance] sendOtp failed:", err);
    return { success: false, error: "OTP পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
  }
}

/** Step 2: verify OTP then enable maintenance mode with the given message. */
export async function enableMaintenance(
  otpCode: string,
  message: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const user = await requireAdmin();
    await dbConnect();

    const dbUser = await User.findById(user.id).select("phone").lean();
    if (!dbUser || !(dbUser as { phone?: string }).phone) {
      return { success: false, error: "ফোন নম্বর পাওয়া যায়নি।" };
    }

    const phone = normalizeBDPhone((dbUser as { phone: string }).phone);
    const result = await Otp.verify(phone, otpCode.trim(), "maintenance");

    if (!result.ok) {
      const msgs: Record<string, string> = {
        not_found: "কোনো OTP পাওয়া যায়নি। আবার কোড পাঠান।",
        expired: "OTP মেয়াদ শেষ। আবার কোড পাঠান।",
        too_many_attempts: "অনেক বার ভুল চেষ্টা। আবার কোড পাঠান।",
        invalid: "ভুল OTP। আবার চেষ্টা করুন।",
      };
      return { success: false, error: msgs[result.reason] ?? "যাচাই ব্যর্থ।" };
    }

    const finalMessage = message.trim() || undefined;

    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { "maintenance.enabled": true, ...(finalMessage ? { "maintenance.message": finalMessage } : {}) } },
      { upsert: true },
    );

    return { success: true };
  } catch (err) {
    console.error("[maintenance] enable failed:", err);
    return { success: false, error: "মেইনটেন্যান্স মোড চালু করতে সমস্যা হয়েছে।" };
  }
}

/** Disable maintenance mode — no OTP required. */
export async function disableMaintenance(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    await dbConnect();

    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { "maintenance.enabled": false } },
      { upsert: true },
    );

    return { success: true };
  } catch (err) {
    console.error("[maintenance] disable failed:", err);
    return { success: false, error: "মেইনটেন্যান্স মোড বন্ধ করতে সমস্যা হয়েছে।" };
  }
}

/** Update the maintenance message (without changing enabled state). */
export async function updateMaintenanceMessage(
  message: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    if (!message.trim()) return { success: false, error: "মেসেজ খালি রাখা যাবে না।" };
    await dbConnect();

    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { "maintenance.message": message.trim() } },
      { upsert: true },
    );

    return { success: true };
  } catch {
    return { success: false, error: "মেসেজ আপডেট করতে সমস্যা হয়েছে।" };
  }
}
