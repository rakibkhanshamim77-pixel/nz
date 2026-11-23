/**
 * Centralised permission catalogue.
 *
 * Pure data + pure functions only — no mongoose, no next/headers — so this file is
 * safe to import from client components as well as server code.
 *
 * To add a module permission: add one entry to PERMISSIONS. Everything that lists,
 * validates or renders permissions is derived from it.
 */

/** Role strings, kept in sync with the `UserRole` enum in db/models/User.ts. */
export type Role = "user" | "admin" | "moderator";

export const ROLES: readonly Role[] = ["user", "moderator", "admin"] as const;

export const ROLE_LABEL: Record<Role, string> = {
  user: "Customer",
  moderator: "Staff",
  admin: "Administrator",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  user: "Shopper account — orders, addresses and profile only. No admin panel access.",
  moderator: "Staff account. Gets exactly the module permissions you assign below.",
  admin: "Full access to every module, including user management. Cannot be restricted.",
};

export interface PermissionMeta {
  label: string;
  /** Shown under the label in the permission picker */
  description: string;
  /** Groups permissions into cards in the UI */
  group: "Commerce" | "People" | "System";
  /** Admin path this permission unlocks, when the module exists */
  href?: string;
  /** False for modules that aren't built yet — assignable, but no link shown */
  implemented: boolean;
}

export const PERMISSIONS = {
  order_management: {
    label: "Order Management",
    description: "View orders, update status, verify and reject payments",
    group: "Commerce",
    href: "/admin/orders",
    implemented: true,
  },
  product_management: {
    label: "Product Management",
    description: "Create, edit and delete products, categories and stock",
    group: "Commerce",
    href: "/admin/products",
    implemented: true,
  },
  user_management: {
    label: "User Management",
    description: "Manage staff and customer accounts, roles and permissions",
    group: "People",
    href: "/admin/users",
    implemented: true,
  },
  customers_management: {
    label: "Customer Management",
    description: "View and manage customer profiles and their order history",
    group: "People",
    href: "/admin/customers",
    implemented: true,
  },
  inbox_management: {
    label: "Inbox / Messenger",
    description: "Read and reply to customer messages",
    group: "People",
    href: "/admin/messages",
    implemented: true,
  },
  content_management: {
    label: "Content Management",
    description: "Edit storefront pages, banners, announcements and FAQs",
    group: "System",
    href: "/admin/content",
    implemented: true,
  },
  review_management: {
    label: "Review Management",
    description: "Approve, feature, reply to and delete customer reviews",
    group: "Commerce",
    href: "/admin/reviews",
    implemented: true,
  },
  coupon_management: {
    label: "Coupon Management",
    description: "Create, edit and deactivate discount coupons",
    group: "Commerce",
    href: "/admin/coupons",
    implemented: true,
  },
  settings: {
    label: "Settings",
    description: "Change store details, delivery charges and payment numbers",
    group: "System",
    href: "/admin/settings",
    implemented: true,
  },
} as const satisfies Record<string, PermissionMeta>;

export type Permission = keyof typeof PERMISSIONS;

/** Every permission key, in display order. */
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[];

export const PERMISSION_GROUPS: PermissionMeta["group"][] = ["Commerce", "People", "System"];

export function permissionsInGroup(group: PermissionMeta["group"]): Permission[] {
  return PERMISSION_KEYS.filter((k) => PERMISSIONS[k].group === group);
}

export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PERMISSIONS, value);
}

export function isRole(value: unknown): value is Role {
  return value === "user" || value === "admin" || value === "moderator";
}

/** Drops unknown strings and duplicates, and returns them in catalogue order. */
export function sanitizePermissions(input: unknown): Permission[] {
  if (!Array.isArray(input)) return [];
  const found = new Set<Permission>();
  for (const v of input) if (isPermission(v)) found.add(v);
  return PERMISSION_KEYS.filter((k) => found.has(k));
}

/**
 * What a user can actually do.
 *
 * `admin` is the super-admin role and implicitly holds every permission — this
 * mirrors the behaviour the project already had via requireAdmin(). Every other
 * role gets only what is stored on the user document, so a new permission added
 * to the catalogue is NOT granted to anyone automatically.
 */
export function effectivePermissions(
  user: { role: string; permissions?: string[] | null } | null | undefined,
): Permission[] {
  if (!user) return [];
  if (user.role === "admin") return [...PERMISSION_KEYS];
  // Customers hold no admin modules, whatever the stored list says. Guards against
  // legacy rows or a direct database edit granting storefront accounts admin access.
  if (user.role === "user") return [];
  return sanitizePermissions(user.permissions);
}

export function userHasPermission(
  user: { role: string; permissions?: string[] | null } | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "user") return false;
  return sanitizePermissions(user.permissions).includes(permission);
}

export function userHasAnyPermission(
  user: { role: string; permissions?: string[] | null } | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((p) => userHasPermission(user, p));
}

/** True when the user may open the admin panel at all. */
export function canAccessAdmin(
  user: { role: string; permissions?: string[] | null } | null | undefined,
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return effectivePermissions(user).length > 0;
}

/**
 * Where to send someone who landed on a module they can't open.
 * Returns the first implemented module they do have, else null.
 */
export function firstAllowedModule(
  user: { role: string; permissions?: string[] | null } | null | undefined,
): string | null {
  for (const key of effectivePermissions(user)) {
    const meta = PERMISSIONS[key];
    if (meta.implemented && meta.href) return meta.href;
  }
  return null;
}
