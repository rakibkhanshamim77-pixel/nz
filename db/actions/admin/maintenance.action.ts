"use server";

import dbConnect from "@/db/connect/dbConnect";
import Settings, { SETTINGS_KEY } from "@/db/models/Settings";
import EmailOtp from "@/db/models/EmailOtp";
import User from "@/db/models/User";
import { getCurrentUser } from "@/app/utils/authz";
import { sendOtpEmail } from "@/app/lib/email";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}

/** Step 1: send OTP to the signed-in admin's email. */
export async function sendMaintenanceOtp(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const user = await requireAdmin();
    await dbConnect();

    const dbUser = await User.findById(user.id).select("email").lean();
    if (!dbUser || !(dbUser as { email?: string }).email) {
      return { success: false, error: "No email address found on your account." };
    }

    const email = (dbUser as { email: string }).email.trim().toLowerCase();
    const result = await EmailOtp.issue(email, "maintenance");

    if ("error" in result) {
      return {
        success: false,
        error: `Please wait ${result.retryAfterSeconds} seconds before requesting another code.`,
      };
    }

    await sendOtpEmail(email, result.code);
    return { success: true };
  } catch (err) {
    console.error("[maintenance] sendOtp failed:", err);
    return { success: false, error: "Failed to send OTP email. Please try again." };
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

    const dbUser = await User.findById(user.id).select("email").lean();
    if (!dbUser || !(dbUser as { email?: string }).email) {
      return { success: false, error: "Email address not found." };
    }

    const email = (dbUser as { email: string }).email.trim().toLowerCase();
    const result = await EmailOtp.verify(email, otpCode.trim(), "maintenance");

    if (!result.ok) {
      const msgs: Record<string, string> = {
        not_found: "No OTP found. Please request a new code.",
        expired: "OTP expired. Please request a new code.",
        too_many_attempts: "Too many wrong attempts. Please request a new code.",
        invalid: "Incorrect OTP. Please try again.",
      };
      return { success: false, error: msgs[result.reason] ?? "Verification failed." };
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
    return { success: false, error: "Failed to enable maintenance mode." };
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
    return { success: false, error: "Failed to disable maintenance mode." };
  }
}

/** Update the maintenance message (without changing enabled state). */
export async function updateMaintenanceMessage(
  message: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    if (!message.trim()) return { success: false, error: "Message cannot be empty." };
    await dbConnect();

    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { "maintenance.message": message.trim() } },
      { upsert: true },
    );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update message." };
  }
}
