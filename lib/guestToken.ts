import crypto from "crypto";

export function deriveGuestToken(orderId: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not set");
  return crypto
    .createHmac("sha256", secret)
    .update(`guestpay:${orderId}`)
    .digest("hex");
}

export function verifyGuestToken(orderId: string, token: string): boolean {
  try {
    const expected = deriveGuestToken(orderId);
    const a = Buffer.from(token, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
