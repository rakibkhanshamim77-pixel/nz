import mongoose, { Document, Model, Schema } from "mongoose";
import crypto from "crypto";

export const EMAIL_OTP_LENGTH = 6;
export const EMAIL_OTP_TTL_MINUTES = 5;
export const EMAIL_OTP_MAX_ATTEMPTS = 5;
export const EMAIL_OTP_RESEND_COOLDOWN_SECONDS = 60;

export type EmailOtpPurpose = "register" | "verify_email" | "reset_password";

export interface IEmailOtp {
  email: string;
  codeHash: string;
  purpose: EmailOtpPurpose;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailOtpDocument extends IEmailOtp, Document {}

export type EmailVerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "invalid" };

export interface IEmailOtpModel extends Model<IEmailOtpDocument> {
  issue(email: string, purpose?: EmailOtpPurpose): Promise<{ code: string } | { error: "cooldown"; retryAfterSeconds: number }>;
  verify(email: string, code: string, purpose?: EmailOtpPurpose): Promise<EmailVerifyResult>;
}

function hashCode(email: string, code: string): string {
  const secret = process.env.OTP_SECRET || process.env.AUTH_SECRET || "";
  return crypto.createHmac("sha256", secret).update(`${email}:${code}`).digest("hex");
}

function generateCode(): string {
  return crypto.randomInt(0, 10 ** EMAIL_OTP_LENGTH).toString().padStart(EMAIL_OTP_LENGTH, "0");
}

const EmailOtpSchema = new Schema<IEmailOtpDocument, IEmailOtpModel>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true, select: false },
    purpose: { type: String, enum: ["register", "verify_email", "reset_password"], default: "register" },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

EmailOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

EmailOtpSchema.statics.issue = async function (email: string, purpose: EmailOtpPurpose = "register") {
  const normalized = email.trim().toLowerCase();
  const existing = await this.findOne({ email: normalized, purpose });
  if (existing) {
    const elapsed = (Date.now() - existing.updatedAt.getTime()) / 1000;
    if (elapsed < EMAIL_OTP_RESEND_COOLDOWN_SECONDS) {
      return { error: "cooldown" as const, retryAfterSeconds: Math.ceil(EMAIL_OTP_RESEND_COOLDOWN_SECONDS - elapsed) };
    }
  }

  const code = generateCode();
  await this.findOneAndUpdate(
    { email: normalized, purpose },
    { $set: { codeHash: hashCode(normalized, code), attempts: 0, expiresAt: new Date(Date.now() + EMAIL_OTP_TTL_MINUTES * 60 * 1000) } },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return { code };
};

EmailOtpSchema.statics.verify = async function (email: string, code: string, purpose: EmailOtpPurpose = "register"): Promise<EmailVerifyResult> {
  const normalized = email.trim().toLowerCase();
  const otp = await this.findOne({ email: normalized, purpose }).select("+codeHash");
  if (!otp) return { ok: false, reason: "not_found" };
  if (otp.expiresAt.getTime() < Date.now()) { await otp.deleteOne(); return { ok: false, reason: "expired" }; }
  if (otp.attempts >= EMAIL_OTP_MAX_ATTEMPTS) { await otp.deleteOne(); return { ok: false, reason: "too_many_attempts" }; }

  const expected = Buffer.from(otp.codeHash, "hex");
  const given = Buffer.from(hashCode(normalized, String(code).trim()), "hex");
  const match = expected.length === given.length && crypto.timingSafeEqual(expected, given);

  if (!match) { otp.attempts += 1; await otp.save(); return { ok: false, reason: "invalid" }; }

  await otp.deleteOne();
  return { ok: true };
};

const EmailOtp =
  (mongoose.models.EmailOtp as IEmailOtpModel) ||
  mongoose.model<IEmailOtpDocument, IEmailOtpModel>("EmailOtp", EmailOtpSchema);

export default EmailOtp;
