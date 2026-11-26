import type { Permission, Role } from "@/db/permissions";
import type { UserFieldErrors } from "@/db/validation/user.validation";

/**
 * Fields this form owns. Deliberately narrower than the mockup: `username`,
 * single-line `address` and a four-state status don't exist on the User schema,
 * so they aren't collected here.
 */
export interface UserFormState {
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  role: Role;
  permissions: Permission[];
  isActive: boolean;
  /** Create only — staff sign in with a password, customers use OTP */
  password: string;
}

/** Plain, serialisable user data passed from the edit page (server) to the form (client). */
export interface UserFormInitial {
  id: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  role: Role;
  permissions: Permission[];
  isActive: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
}

/** The signed-in admin, so the UI can mirror the server's escalation rules. */
export interface ViewerContext {
  id: string;
  role: Role;
  /** Effective permissions — the ceiling on what this viewer can grant */
  permissions: Permission[];
}

export type UserFormErrors = UserFieldErrors;
export type UserFormPatch = Partial<UserFormState>;

export const PHONE_MAX = 11;
