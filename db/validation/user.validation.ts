import { isRole, sanitizePermissions, type Permission, type Role } from "../permissions";

export const USER_LIMITS = {
  nameMin: 2,
  nameMax: 50,
  emailMax: 80,
  passwordMin: 8,
  passwordMax: 72,
} as const;

/** Mirrors the model's regex: 11 digits starting 013–019. */
export const BD_PHONE_INPUT = /^01[3-9]\d{8}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shape the user form sends to the create/update actions. */
export interface UserPayload {
  name: string;
  email: string;
  phone: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
  /** Only used on create, and only for staff/admin accounts */
  password?: string;
}

export type UserFieldKey = keyof UserPayload;
export type UserFieldErrors = Partial<Record<UserFieldKey, string>>;

export interface CleanUser {
  name?: string;
  email?: string;
  phone: string;
  role: Role;
  permissions: Permission[];
  isActive: boolean;
  password?: string;
}

export type UserValidation =
  | { ok: true; data: CleanUser }
  | { ok: false; errors: UserFieldErrors };

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Accepts 01XXXXXXXXX, +8801XXXXXXXXX and 8801XXXXXXXXX; returns 01XXXXXXXXX. */
export function normalizePhoneInput(raw: unknown): string {
  let s = text(raw).replace(/[\s-]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("880")) s = "0" + s.slice(3);
  return s;
}

/**
 * `requirePassword` is true when creating a staff/admin account that logs in with
 * a password. Customers authenticate by OTP, so their password stays unset.
 */
export function validateUser(
  raw: unknown,
  opts: { mode: "create" | "edit"; requirePassword?: boolean } = { mode: "create" },
): UserValidation {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: UserFieldErrors = {};
  const L = USER_LIMITS;

  // Name — optional in the schema, but we ask for it on staff accounts
  const name = text(input.name).replace(/\s+/g, " ");
  if (name && name.length < L.nameMin) errors.name = `Name must be at least ${L.nameMin} characters`;
  else if (name.length > L.nameMax) errors.name = `Keep the name under ${L.nameMax} characters`;

  // Email — optional, but must be valid and is unique when present
  const email = text(input.email).toLowerCase();
  if (email) {
    if (email.length > L.emailMax) errors.email = `Keep the email under ${L.emailMax} characters`;
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address";
  }

  // Phone — the login identity, always required
  const phone = normalizePhoneInput(input.phone);
  if (!phone) errors.phone = "Enter a mobile number";
  else if (!BD_PHONE_INPUT.test(phone))
    errors.phone = "Enter a valid Bangladeshi number, e.g. 01712345678";

  // Role
  const roleRaw = input.role;
  if (!isRole(roleRaw)) errors.role = "Choose a role";
  const role = (isRole(roleRaw) ? roleRaw : "user") as Role;

  // Permissions — unknown keys are dropped rather than rejected.
  // Admins hold everything implicitly, so we never store a list for them;
  // customers have no admin modules at all.
  const permissions = role === "admin" || role === "user" ? [] : sanitizePermissions(input.permissions);

  if (role === "moderator" && permissions.length === 0)
    errors.permissions = "Give this staff account at least one permission, or make it a customer";

  const isActive = input.isActive !== false;

  // Password — only meaningful for staff/admin on create
  let password: string | undefined;
  const passwordRaw = typeof input.password === "string" ? input.password : "";
  const needsPassword = opts.mode === "create" && opts.requirePassword && role !== "user";
  if (passwordRaw) {
    if (passwordRaw.length < L.passwordMin)
      errors.password = `Password must be at least ${L.passwordMin} characters`;
    else if (passwordRaw.length > L.passwordMax) errors.password = "Password is too long";
    else password = passwordRaw;
  } else if (needsPassword) {
    errors.password = "Set a password so this person can sign in";
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name: name || undefined,
      email: email || undefined,
      phone,
      role,
      permissions,
      isActive,
      password,
    },
  };
}
