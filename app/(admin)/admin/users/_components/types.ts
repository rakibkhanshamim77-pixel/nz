import type { Permission, Role } from "@/db/permissions";

/** Derived, not stored: the schema has isActive + isPhoneVerified, not a status enum. */
export type UserStatus = "active" | "inactive" | "pending";

export const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

export function statusOf(u: { isActive: boolean; isPhoneVerified: boolean }): UserStatus {
  if (!u.isActive) return "inactive";
  return u.isPhoneVerified ? "active" : "pending";
}

/** Plain, serialisable row passed from the users page (server) to the table (client). */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  permissions: Permission[];
  /** Admins hold everything implicitly — this is the resolved list */
  effectivePermissions: Permission[];
  isActive: boolean;
  isPhoneVerified: boolean;
  profileImage: string;
  createdAt: string;
  lastLogin: string | null;
  orderCount: number;
}

export const USER_TYPE_TABS = ["all", "staff", "customers"] as const;
export type UserTypeTab = (typeof USER_TYPE_TABS)[number];

/* Pure helpers live here, not in a component file: a non-component export of a
   "use client" module becomes a client reference and isn't callable from a
   server component. */

export const editHref = (u: Pick<UserRow, "id">) => `/admin/users/edit/${u.id}`;

export const fmtDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

/** "3 days ago" style, falling back to a date once it's far enough back. */
export function fmtRelative(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Never";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return fmtDate(iso);
}
