"use server";

import { cookies } from "next/headers";
import dbConnect from "@/db/connect/dbConnect";
import Otp from "@/db/models/OTP";
import EmailOtp from "@/db/models/EmailOtp";
import User, { normalizeBDPhone, BD_PHONE_REGEX } from "@/db/models/User";
import {
  makeSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/app/utils/session";
import { sendOtp } from "@/app/lib/sms";
import { sendOtpEmail } from "@/app/lib/email";

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

/**
 * Login with email or phone + password.
 */
export async function loginWithPassword(
  identifier: string,
  password: string,
): Promise<ActionResult<undefined>> {
  if (!identifier?.trim() || !password?.trim()) {
    return { success: false, error: "Email/phone and password are required." };
  }

  await dbConnect();

  const isEmail = identifier.includes("@");
  const user = isEmail
    ? await User.findOne({ email: identifier.trim().toLowerCase() }).select("+password")
    : await User.findByPhone(identifier.trim()).select("+password") as typeof import("@/db/models/User").default.prototype | null;

  if (!user || !user.isActive) {
    return { success: false, error: "Invalid email/phone or password." };
  }

  if (!user.password) {
    return { success: false, error: "This account uses Google login. Please sign in with Google." };
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return { success: false, error: "Invalid email/phone or password." };
  }

  user.lastLogin = new Date();
  await user.save();

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
 * Forgot password step 1: send OTP to the account's email.
 */
export async function sendPasswordResetOtp(
  email: string,
): Promise<ActionResult<{ email: string }>> {
  email = email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    // Don't reveal whether the email exists
    return { success: true, data: { email } };
  }

  if (!user.password) {
    return { success: false, error: "This account uses Google login. Please sign in with Google." };
  }

  const result = await EmailOtp.issue(email, "reset_password");
  if ("error" in result) {
    return { success: false, error: `Please wait ${result.retryAfterSeconds} seconds before requesting another code.` };
  }

  try {
    await sendOtpEmail(email, result.code);
  } catch (err) {
    console.error("[sendPasswordResetOtp] email failed:", err);
    return { success: false, error: "Failed to send email. Please try again." };
  }

  return { success: true, data: { email } };
}

/**
 * Forgot password step 2: verify OTP.
 */
export async function verifyPasswordResetOtp(
  email: string,
  code: string,
): Promise<ActionResult<undefined>> {
  email = email?.trim().toLowerCase();
  code = code?.trim();
  if (!/^\d{6}$/.test(code)) return { success: false, error: "Enter the 6-digit code." };

  await dbConnect();
  const result = await EmailOtp.verify(email, code, "reset_password");
  if (!result.ok) {
    const messages = {
      not_found: "No code found. Please request a new one.",
      expired: "Code expired. Please request a new one.",
      too_many_attempts: "Too many wrong attempts. Please request a new one.",
      invalid: "Incorrect code. Please try again.",
    };
    return { success: false, error: messages[result.reason] };
  }

  return { success: true, data: undefined };
}

/**
 * Forgot password step 3: set new password and log the user in.
 */
export async function resetPassword(
  email: string,
  password: string,
): Promise<ActionResult<undefined>> {
  email = email?.trim().toLowerCase();
  password = password?.trim();
  if (!password || password.length < 8) return { success: false, error: "Password must be at least 8 characters." };

  await dbConnect();
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive) return { success: false, error: "Account not found." };

  user.password = password;
  await user.hashPassword();
  user.lastLogin = new Date();
  await user.save();

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
 * Step 1 of registration: validate data, send OTP to email.
 */
export async function sendRegisterOtp(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<ActionResult<{ email: string }>> {
  name = name?.trim();
  email = email?.trim().toLowerCase();
  phone = phone?.trim();
  password = password?.trim();

  if (!name || name.length < 2) return { success: false, error: "Name must be at least 2 characters." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { success: false, error: "Enter a valid email address." };
  if (!phone || phone.replace(/\D/g, "").length < 6) return { success: false, error: "Enter a valid phone number." };
  if (!password || password.length < 8) return { success: false, error: "Password must be at least 8 characters." };

  await dbConnect();

  const existingEmail = await User.findOne({ email });
  if (existingEmail) return { success: false, error: "This email is already registered." };

  const existingPhone = await User.findByPhone(phone);
  if (existingPhone) return { success: false, error: "This phone number is already registered." };

  const result = await EmailOtp.issue(email, "register");
  if ("error" in result) {
    return { success: false, error: `Please wait ${result.retryAfterSeconds} seconds before requesting another code.` };
  }

  try {
    await sendOtpEmail(email, result.code);
  } catch (err) {
    console.error("[sendRegisterOtp] email failed:", err);
    return { success: false, error: "Failed to send verification email. Please try again." };
  }

  return { success: true, data: { email } };
}

/**
 * Step 2 of registration: verify OTP, create account, issue session.
 */
export async function verifyRegisterOtp(
  name: string,
  email: string,
  phone: string,
  password: string,
  code: string,
): Promise<ActionResult<undefined>> {
  email = email?.trim().toLowerCase();
  code = code?.trim();

  if (!/^\d{6}$/.test(code)) return { success: false, error: "Enter the 6-digit code." };

  await dbConnect();

  const result = await EmailOtp.verify(email, code, "register");
  if (!result.ok) {
    const messages = {
      not_found: "No code found. Please request a new one.",
      expired: "Code expired. Please request a new one.",
      too_many_attempts: "Too many wrong attempts. Please request a new one.",
      invalid: "Incorrect code. Please try again.",
    };
    return { success: false, error: messages[result.reason] };
  }

  // Double-check uniqueness (race condition guard)
  const existingEmail = await User.findOne({ email });
  if (existingEmail) return { success: false, error: "This email is already registered." };

  const rawPhone = phone.trim();
  const existingPhone = await User.findOne({ phone: rawPhone });
  if (existingPhone) return { success: false, error: "This phone number is already registered." };

  const user = await User.create({
    name: name.trim(),
    email,
    phone: rawPhone,
    password,
    isPhoneVerified: false,
    isEmailVerified: true,
    lastLogin: new Date(),
  });
  await user.hashPassword();
  await user.save();

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
