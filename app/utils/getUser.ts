import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./session";
import dbConnect from "@/db/connect/dbConnect";
import User from "@/db/models/User";

export interface AuthUser {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: string;
  profileImage?: string;
  isPhoneVerified: boolean;
  permissions: string[];
}

/**
 * Returns the currently authenticated user from the session cookie,
 * or null if the session is missing, invalid, expired, or the user
 * has been deactivated. Safe to call from any server component or page.
 *
 * Wrapped in React's cache() so the layout, the sidebar and a page's permission
 * guard share one database read per request. Still re-read on every new request,
 * so role, permission and isActive changes take effect immediately.
 */
export const getUser = cache(async function getUser(): Promise<AuthUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = verifySession(token);
  if (!session) return null;

  try {
    await dbConnect();
    const user = await User.findById(session.userId).lean();
    if (!user || !user.isActive) return null;

    return {
      id: String(user._id),
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isPhoneVerified: user.isPhoneVerified,
      permissions: user.permissions ?? [],
    };
  } catch {
    return null;
  }
});
