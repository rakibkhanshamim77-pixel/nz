import mongoose, { Document, Model, Schema } from "mongoose";
import crypto from "crypto";
import { normalizeBDPhone, BD_PHONE_REGEX } from "./User";

/**
 * One-time passwords for mobile login / registration.
 * Kept in their own collection (not on User) because an OTP is sent
 * BEFORE the user exists, and MongoDB auto-deletes expired codes via a TTL index.
 */

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export type OtpPurpose = "login" | "verify_phone" | "maintenance";

export interface IOtp {
  phone: string;
  codeHash: string; // never store the plain code
  purpose: OtpPurpose;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpDocument extends IOtp, Document {}

export type VerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "expired" | "too_many_attempts" | "invalid";
    };

export interface IOtpModel extends Model<IOtpDocument> {
  /** Creates a new code for the phone (replacing any old one). Returns the plain code to send by SMS. */
  issue(
    phone: string,
    purpose?: OtpPurpose,
  ): Promise<
    { code: string } | { error: "cooldown"; retryAfterSeconds: number }
  >;
  /** Checks a code. Deletes it on success so it can't be reused. */
  verify(
    phone: string,
    code: string,
    purpose?: OtpPurpose,
  ): Promise<VerifyResult>;
}

function hashCode(phone: string, code: string): string {
  const secret = process.env.OTP_SECRET || process.env.AUTH_SECRET || "";
  return crypto
    .createHmac("sha256", secret)
    .update(`${phone}:${code}`)
    .digest("hex");
}

function generateCode(): string {
  return crypto
    .randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

const OtpSchema = new Schema<IOtpDocument, IOtpModel>(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      set: normalizeBDPhone,
      match: [BD_PHONE_REGEX, "বৈধ বাংলাদেশি মোবাইল নম্বর প্রদান করুন"],
    },
    codeHash: { type: String, required: true, select: false },
    purpose: {
      type: String,
      enum: ["login", "verify_phone", "maintenance"],
      default: "login",
    },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// One active code per phone + purpose
OtpSchema.index({ phone: 1, purpose: 1 }, { unique: true });
// MongoDB removes the document automatically once expiresAt passes
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OtpSchema.statics.issue = async function (
  phone: string,
  purpose: OtpPurpose = "login",
) {
  const normalized = normalizeBDPhone(phone);

  const existing = await this.findOne({ phone: normalized, purpose });
  if (existing) {
    const elapsed = (Date.now() - existing.updatedAt.getTime()) / 1000;
    if (elapsed < OTP_RESEND_COOLDOWN_SECONDS) {
      return {
        error: "cooldown" as const,
        retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsed),
      };
    }
  }

  const code = generateCode();
  await this.findOneAndUpdate(
    { phone: normalized, purpose },
    {
      $set: {
        codeHash: hashCode(normalized, code),
        attempts: 0,
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
      },
    },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return { code };
};

OtpSchema.statics.verify = async function (
  phone: string,
  code: string,
  purpose: OtpPurpose = "login",
): Promise<VerifyResult> {
  const normalized = normalizeBDPhone(phone);
  const otp = await this.findOne({ phone: normalized, purpose }).select(
    "+codeHash",
  );

  if (!otp) return { ok: false, reason: "not_found" };
  if (otp.expiresAt.getTime() < Date.now()) {
    await otp.deleteOne();
    return { ok: false, reason: "expired" };
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await otp.deleteOne();
    return { ok: false, reason: "too_many_attempts" };
  }

  const expected = Buffer.from(otp.codeHash, "hex");
  const given = Buffer.from(hashCode(normalized, String(code).trim()), "hex");
  const match =
    expected.length === given.length && crypto.timingSafeEqual(expected, given);

  if (!match) {
    otp.attempts += 1;
    await otp.save();
    return { ok: false, reason: "invalid" };
  }

  await otp.deleteOne(); // single use
  return { ok: true };
};

const Otp =
  (mongoose.models.Otp as IOtpModel) ||
  mongoose.model<IOtpDocument, IOtpModel>("Otp", OtpSchema);

export default Otp;
