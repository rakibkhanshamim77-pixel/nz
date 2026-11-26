import { NextResponse, type NextRequest } from "next/server";
import { GOOGLE_STATE_COOKIE, googleAuthUrl, isGoogleConfigured, newState, requestOrigin } from "@/app/utils/googleAuth";

export const dynamic = "force-dynamic";

/** Step 1 of "Continue with Google": send the browser to Google's account chooser. */
export async function GET(req: NextRequest) {
  if (!isGoogleConfigured())
    return NextResponse.redirect(new URL("/login?error=google_unavailable", requestOrigin(req)));

  const state = newState();
  const res = NextResponse.redirect(googleAuthUrl(req, state));
  // CSRF protection: the callback must bring back the same state value
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 10 * 60,
  });
  return res;
}
