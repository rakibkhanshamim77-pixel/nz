import crypto from "crypto";
import type { NextRequest } from "next/server";
import { signPayload, verifyPayload } from "./session";

/**
 * "Continue with Google" (OAuth 2.0 authorization-code flow), no extra libraries.
 *
 * Env:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   from Google Cloud Console → Credentials
 *   GOOGLE_REDIRECT_URI (optional)           defaults to <site origin>/api/auth/google/callback
 */

export const GOOGLE_STATE_COOKIE = "g_oauth_state";
export const GOOGLE_PENDING_COOKIE = "g_pending";
/** How long a Google user has to enter their phone number after signing in */
export const PENDING_TTL_MS = 15 * 60 * 1000;

export function isGoogleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

/** Public origin of this request, respecting a reverse proxy (nginx / IIS) in front of Node. */
export function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
    req.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function redirectUri(req: NextRequest): string {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || `${requestOrigin(req)}/api/auth/google/callback`;
}

export function newState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function googleAuthUrl(req: NextRequest, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export interface GoogleProfile {
  sub: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

/**
 * Exchanges the authorization code for tokens and reads the ID token.
 * The ID token comes straight from Google's token endpoint over TLS, so per Google's docs its
 * signature doesn't need re-verifying; the audience, issuer and expiry are still checked.
 */
export async function exchangeCode(req: NextRequest, code: string): Promise<GoogleProfile | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
      redirect_uri: redirectUri(req),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    console.error("[google] token exchange failed", res.status, await res.text().catch(() => ""));
    return null;
  }

  const { id_token } = (await res.json()) as { id_token?: string };
  const part = id_token?.split(".")[1];
  if (!part) return null;

  try {
    const c = JSON.parse(Buffer.from(part, "base64url").toString()) as Record<string, unknown>;
    const issOk = c.iss === "https://accounts.google.com" || c.iss === "accounts.google.com";
    const audOk = c.aud === process.env.GOOGLE_CLIENT_ID!.trim();
    const expOk = typeof c.exp === "number" && c.exp * 1000 > Date.now();
    if (!issOk || !audOk || !expOk || typeof c.sub !== "string") return null;

    return {
      sub: c.sub,
      email: typeof c.email === "string" ? c.email.toLowerCase() : undefined,
      emailVerified: c.email_verified === true || c.email_verified === "true",
      name: typeof c.name === "string" ? c.name.slice(0, 50) : undefined,
      picture: typeof c.picture === "string" ? c.picture : undefined,
    };
  } catch {
    return null;
  }
}

// ─── Pending sign-up (Google OK, phone number still missing) ─────────────────

interface PendingPayload {
  kind: "google_pending";
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  exp: number;
}

export type PendingGoogleUser = Omit<PendingPayload, "kind" | "exp">;

export function signPending(p: GoogleProfile): string {
  return signPayload<PendingPayload>({
    kind: "google_pending",
    sub: p.sub,
    // Only a Google-verified email is kept
    email: p.emailVerified ? p.email : undefined,
    name: p.name,
    picture: p.picture,
    exp: Date.now() + PENDING_TTL_MS,
  });
}

export function readPending(token: string | undefined): PendingGoogleUser | null {
  if (!token) return null;
  const p = verifyPayload<PendingPayload>(token);
  if (!p || p.kind !== "google_pending" || typeof p.sub !== "string") return null;
  return { sub: p.sub, email: p.email, name: p.name, picture: p.picture };
}
