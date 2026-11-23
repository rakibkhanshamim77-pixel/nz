/**
 * Server-side authorization. Every helper re-reads the user from the database
 * through getUser(), so a role change, a permission change or a deactivation
 * takes effect on the next request instead of when the session cookie expires.
 *
 * Never derive permissions from the session token or from anything the client sends.
 */

import { redirect } from "next/navigation";
import { getUser, type AuthUser } from "./getUser";
import {
  canAccessAdmin,
  effectivePermissions,
  firstAllowedModule,
  userHasAnyPermission,
  userHasPermission,
  type Permission,
} from "@/db/permissions";

/** The signed-in, active user, or null. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return getUser();
}

/** The current user's effective permissions (admins get all of them). */
export async function getUserPermissions(): Promise<Permission[]> {
  return effectivePermissions(await getUser());
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  return userHasPermission(await getUser(), permission);
}

/** Returns the user when they hold `permission`, otherwise null. */
export async function requirePermission(permission: Permission): Promise<AuthUser | null> {
  const user = await getUser();
  return userHasPermission(user, permission) ? user : null;
}

/** Returns the user when they hold at least one of `permissions`, otherwise null. */
export async function requireAnyPermission(
  permissions: readonly Permission[],
): Promise<AuthUser | null> {
  const user = await getUser();
  return userHasAnyPermission(user, permissions) ? user : null;
}

/** Returns the user when they hold every one of `permissions`, otherwise null. */
export async function requireAllPermissions(
  permissions: readonly Permission[],
): Promise<AuthUser | null> {
  const user = await getUser();
  if (!user) return null;
  return permissions.every((p) => userHasPermission(user, p)) ? user : null;
}

/**
 * Page guard. Returns the user, or redirects and never returns.
 *
 * Not signed in / no admin access at all  -> /login
 * Signed in but missing this permission   -> their first allowed module, else /admin/no-access
 *
 * The fallback chain can't loop: /admin/no-access requires no permission, and a
 * user is only sent to a module they were just confirmed to hold.
 */
export async function guardPage(permission: Permission): Promise<AuthUser> {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) redirect("/login");
  if (userHasPermission(user, permission)) return user;

  const fallback = firstAllowedModule(user);
  redirect(fallback ?? "/admin/no-access");
}

/** Like guardPage, but passes when the user holds any one of `permissions`. */
export async function guardPageAny(
  permissions: readonly Permission[],
): Promise<AuthUser> {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) redirect("/login");
  if (userHasAnyPermission(user, permissions)) return user;

  const fallback = firstAllowedModule(user);
  redirect(fallback ?? "/admin/no-access");
}

/** Standard refusal text for server actions. Deliberately vague about why. */
export const NOT_ALLOWED = "You don't have permission to do that.";
