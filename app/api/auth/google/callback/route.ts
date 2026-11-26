import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/db/connect/dbConnect";
import User from "@/db/models/User";
import { makeSessionToken, sessionCookieOptions } from "@/app/utils/session";
import {
  GOOGLE_PENDING_COOKIE,
  GOOGLE_STATE_COOKIE,
  PENDING_TTL_MS,
  exchangeCode,
  isGoogleConfigured,
  requestOrigin,
  signPending,
} from "@/app/utils/googleAuth";

export const dynamic = "force-dynamic";

function sameState(a: string | undefined, b: string | null): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Step 2 of "Continue with Google": Google sends the user back here with a one-time code. */
export async function GET(req: NextRequest) {
  const origin = requestOrigin(req);
  const to = (path: string) => NextResponse.redirect(new URL(path, origin));
  const fail = (reason: string) => {
    const res = to(`/login?error=${reason}`);
    res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
    return res;
  };

  if (!isGoogleConfigured()) return fail("google_unavailable");

  const params = req.nextUrl.searchParams;
  if (params.get("error")) return fail("google_cancelled"); // user closed / denied the Google screen
  if (!sameState(req.cookies.get(GOOGLE_STATE_COOKIE)?.value, params.get("state"))) return fail("google_failed");

  const code = params.get("code");
  const profile = code ? await exchangeCode(req, code).catch(() => null) : null;
  if (!profile) return fail("google_failed");

  try {
    await dbConnect();

    // 1) Already linked to this Google account
    let user = await User.findOne({ googleId: profile.sub });

    // 2) Existing account whose email was verified → link it (unverified emails are never trusted)
    if (!user && profile.email && profile.emailVerified) {
      user = await User.findOne({ email: profile.email, isEmailVerified: true, googleId: { $exists: false } });
      if (user) user.googleId = profile.sub;
    }

    if (user) {
      if (!user.isActive) return fail("account_disabled");
      user.lastLogin = new Date();
      if (!user.profileImage && profile.picture) user.profileImage = profile.picture;
      if (!user.name && profile.name && profile.name.length >= 2) user.name = profile.name;
      await user.save();

      const res = to("/");
      const opts = sessionCookieOptions();
      res.cookies.set(opts.name, makeSessionToken(user), opts);
      res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
      res.cookies.delete(GOOGLE_PENDING_COOKIE);
      return res;
    }

    // 3) New customer: Google is fine, but every account needs a phone number → ask for it
    const res = to("/login?step=phone");
    res.cookies.set(GOOGLE_PENDING_COOKIE, signPending(profile), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PENDING_TTL_MS / 1000,
    });
    res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
    return res;
  } catch (error) {
    console.error("[google callback]", error);
    return fail("google_failed");
  }
}
