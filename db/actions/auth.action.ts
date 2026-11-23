"use server";

import { cookies } from "next/headers";
import dbConnect from "@/db/connect/dbConnect";
import Otp from "@/db/models/OTP";
import User, { normalizeBDPhone, BD_PHONE_REGEX } from "@/db/models/User";
import {
  makeSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/app/utils/session";
import { sendOtp } from "@/app/lib/sms";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Step 1: Issue an OTP and deliver it via SMS.
 */
export async function requestOtp(
  phone: string,
): Promise<ActionResult<{ phone: string }>> {
  const normalized = normalizeBDPhone(phone.trim());
  if (!BD_PHONE_REGEX.test(normalized)) {
    return {
      success: false,
      error: "বৈধ বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)",
    };
  }

  await dbConnect();
  const result = await Otp.issue(normalized);

  if ("error" in result) {
    return {
      success: false,
      error: `অনুগ্রহ করে ${result.retryAfterSeconds} সেকেন্ড পরে আবার চেষ্টা করুন`,
    };
  }

  try {
    await sendOtp(normalized, result.code);
  } catch (err) {
    console.error("[requestOtp] SMS send failed:", err);
    return {
      success: false,
      error: "SMS পাঠানো যায়নি। পরে আবার চেষ্টা করুন।",
    };
  }

  return { success: true, data: { phone: normalized } };
}

/**
 * Step 2: Verify the OTP, then find-or-create the user and issue a session cookie.
 */
export async function verifyOtp(
  phone: string,
  code: string,
): Promise<ActionResult<undefined>> {
  const normalized = normalizeBDPhone(phone.trim());
  if (!BD_PHONE_REGEX.test(normalized)) {
    return { success: false, error: "অবৈধ মোবাইল নম্বর" };
  }

  const trimmedCode = code.trim();
  if (!/^\d{6}$/.test(trimmedCode)) {
    return { success: false, error: "৬ সংখ্যার কোড দিন" };
  }

  await dbConnect();
  const result = await Otp.verify(normalized, trimmedCode);

  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      not_found: "কোনো OTP পাওয়া যায়নি। আবার কোড পাঠান।",
      expired: "OTP মেয়াদ শেষ হয়ে গেছে। আবার কোড পাঠান।",
      too_many_attempts: "অনেকবার ভুল কোড দেওয়া হয়েছে। আবার কোড পাঠান।",
      invalid: "কোডটি সঠিক নয়। আবার চেষ্টা করুন।",
    };
    return { success: false, error: messages[result.reason] };
  }

  const user = await User.findOrCreateByPhone(normalized);
  const token = makeSessionToken(user);
  const opts = sessionCookieOptions();

  cookies().set(opts.name, token, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });

  return { success: true, data: undefined };
}

/**
 * Destroy the current session and clear the auth cookie.
 */
export async function logout(): Promise<ActionResult<undefined>> {
  cookies().delete(SESSION_COOKIE);
  return { success: true, data: undefined };
}
