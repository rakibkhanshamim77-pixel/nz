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
import { GOOGLE_PENDING_COOKIE, readPending } from "@/app/utils/googleAuth";

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
 * Google sign-up, last step: the user signed in with Google but has no account yet,
 * so we save the phone number they typed (no OTP for Google sign-ins) and log them in.
 */
export async function completeGoogleSignup(
  phone: string,
): Promise<ActionResult<undefined>> {
  const pending = readPending(cookies().get(GOOGLE_PENDING_COOKIE)?.value);
  if (!pending) {
    return {
      success: false,
      error: "সময় শেষ হয়ে গেছে। আবার Google দিয়ে লগইন করুন।",
    };
  }

  const normalized = normalizeBDPhone(phone.trim());
  if (!BD_PHONE_REGEX.test(normalized)) {
    return {
      success: false,
      error: "বৈধ বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)",
    };
  }

  await dbConnect();

  // Signed up in another tab already → just log in
  let user = await User.findOne({ googleId: pending.sub });

  if (!user) {
    // Without OTP we can't prove they own an existing account's number, so never attach to it
    if (await User.exists({ phone: normalized })) {
      return {
        success: false,
        error:
          "এই নম্বরে আগে থেকেই একটি অ্যাকাউন্ট আছে। অন্য নম্বর দিন, অথবা মোবাইল নম্বর ও OTP দিয়ে লগইন করুন।",
      };
    }

    const emailFree =
      !!pending.email && !(await User.exists({ email: pending.email }));

    try {
      user = await User.create({
        phone: normalized,
        isPhoneVerified: false,
        googleId: pending.sub,
        ...(emailFree ? { email: pending.email, isEmailVerified: true } : {}),
        ...(pending.name && pending.name.trim().length >= 2
          ? { name: pending.name.trim() }
          : {}),
        ...(pending.picture ? { profileImage: pending.picture } : {}),
        lastLogin: new Date(),
      });
    } catch (err) {
      if ((err as { code?: number })?.code === 11000) {
        return {
          success: false,
          error: "এই নম্বরে আগে থেকেই একটি অ্যাকাউন্ট আছে। অন্য নম্বর দিন।",
        };
      }
      console.error("[completeGoogleSignup]", err);
      return { success: false, error: "অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।" };
    }
  }

  if (!user.isActive) {
    return { success: false, error: "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।" };
  }

  const opts = sessionCookieOptions();
  cookies().set(opts.name, makeSessionToken(user), {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  cookies().delete(GOOGLE_PENDING_COOKIE);

  return { success: true, data: undefined };
}

/**
 * Cancel a half-finished Google sign-up (user wants to use phone + OTP instead).
 */
export async function cancelGoogleSignup(): Promise<ActionResult<undefined>> {
  cookies().delete(GOOGLE_PENDING_COOKIE);
  return { success: true, data: undefined };
}

/**
 * Destroy the current session and clear the auth cookie.
 */
export async function logout(): Promise<ActionResult<undefined>> {
  cookies().delete(SESSION_COOKIE);
  return { success: true, data: undefined };
}
