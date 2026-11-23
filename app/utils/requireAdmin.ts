import { getUser, type AuthUser } from "./getUser";

/** Resolves the signed-in, active admin from the session, or null. Re-checks the DB on every call. */
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
