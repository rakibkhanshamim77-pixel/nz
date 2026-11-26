import crypto from "crypto";

export const SESSION_COOKIE = "auth_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionPayload {
  userId: string;
  phone: string;
  role: string;
  exp: number;
}

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET env variable is not set");
  return s;
}

export function signSession(payload: SessionPayload): string {
  return signPayload(payload);
}

export function verifySession(token: string): SessionPayload | null {
  return verifyPayload<SessionPayload>(token);
}

/** Signs any JSON payload that carries an `exp` (ms timestamp) with AUTH_SECRET. */
export function signPayload<T extends { exp: number }>(payload: T): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

/** Returns the payload if the signature is valid and it hasn't expired, otherwise null. */
export function verifyPayload<T extends { exp: number }>(token: string): T | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  const a = Buffer.from(sig, "base64url");
  const b = Buffer.from(expected, "base64url");
  if (a.length !== b.length) return null;

  try {
    if (!crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as T;
    if (typeof payload?.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function makeSessionToken(user: {
  _id: { toString(): string };
  phone: string;
  role: string;
}): string {
  return signSession({
    userId: user._id.toString(),
    phone: user.phone,
    role: user.role,
    exp: Date.now() + SESSION_DURATION_MS,
  });
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000, // seconds
  };
}
