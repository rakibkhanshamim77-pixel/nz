import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/db/connect/dbConnect";
import User from "@/db/models/User";
import { makeSessionToken, sessionCookieOptions } from "@/app/utils/session";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login`;

  if (error || !code || !state) {
    return NextResponse.redirect(`${loginUrl}?error=google_cancelled`);
  }

  // Verify CSRF state
  const storedState = cookies().get("google_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${loginUrl}?error=google_state_mismatch`);
  }
  cookies().delete("google_oauth_state");

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`;

  // Exchange code for tokens
  let tokens: GoogleTokenResponse;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    tokens = await res.json();
  } catch (err) {
    console.error("[google/callback] token exchange failed:", err);
    return NextResponse.redirect(`${loginUrl}?error=google_token_failed`);
  }

  // Fetch user info from Google
  let profile: GoogleUserInfo;
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    profile = await res.json();
  } catch (err) {
    console.error("[google/callback] userinfo fetch failed:", err);
    return NextResponse.redirect(`${loginUrl}?error=google_userinfo_failed`);
  }

  if (!profile.email_verified || !profile.email) {
    return NextResponse.redirect(`${loginUrl}?error=google_email_unverified`);
  }

  // Find or create user
  try {
    await dbConnect();
    const user = await User.findOrCreateByGoogle({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const token = makeSessionToken({
      _id: user._id,
      phone: user.phone ?? user.email ?? "",
      role: user.role,
    });
    const opts = sessionCookieOptions();
    cookies().set(opts.name, token, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
  } catch (err) {
    console.error("[google/callback] user upsert failed:", err);
    return NextResponse.redirect(`${loginUrl}?error=google_server_error`);
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/`);
}
