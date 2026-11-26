"use server";

import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requirePermission, NOT_ALLOWED } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import User, { UserRole } from "@/db/models/User";
import {
  effectivePermissions,
  isPermission,
  sanitizePermissions,
  type Permission,
} from "@/db/permissions";
import {
  validateUser,
  type CleanUser,
  type UserFieldKey,
} from "@/db/validation/user.validation";
import type { ActionResult } from "./types";
import type { AuthUser } from "@/app/utils/getUser";

type UserResult = ActionResult<{ id: string }, UserFieldKey>;

const GENERIC = "Something went wrong while saving. Please try again.";
const FIX_FIELDS = "Please fix the highlighted fields.";

function revalidateUsers() {
  revalidatePath("/admin/users");
  revalidatePath("/admin", "layout");
}

/** Every action starts here: must be signed in AND hold user_management. */
async function actor(): Promise<AuthUser | null> {
  return requirePermission("user_management");
}

function isDuplicateKey(
  error: unknown,
): error is { code: number; keyPattern?: Record<string, unknown> } {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;
}

function duplicateFieldError(error: {
  keyPattern?: Record<string, unknown>;
}): UserResult {
  if (error.keyPattern?.phone)
    return { ok: false, error: FIX_FIELDS, fieldErrors: { phone: "Another account already uses this number" } };
  if (error.keyPattern?.email)
    return { ok: false, error: FIX_FIELDS, fieldErrors: { email: "Another account already uses this email" } };
  return { ok: false, error: GENERIC };
}

/**
 * Anti-privilege-escalation rules, checked on the server for every write.
 *
 * - Only an admin may create, edit or delete an admin account. Otherwise a staff
 *   member holding user_management could mint themselves a second, full-power login.
 * - Nobody may grant a permission they don't hold themselves.
 * - Nobody may change their own role or permissions, so user_management can never
 *   be used to widen your own access.
 */
function checkEscalation(
  me: AuthUser,
  next: { role: string; permissions: Permission[] },
  target?: { _id: unknown; role: string },
): { error: string; fieldErrors?: Partial<Record<UserFieldKey, string>> } | null {
  const iAmAdmin = me.role === "admin";
  const editingSelf = target ? String(target._id) === me.id : false;

  if (next.role === "admin" && !iAmAdmin)
    return {
      error: FIX_FIELDS,
      fieldErrors: { role: "Only an administrator can create or promote an administrator" },
    };

  if (target?.role === "admin" && !iAmAdmin)
    return { error: "Only an administrator can change an administrator's account." };

  if (editingSelf && (next.role !== me.role || !sameSet(next.permissions, effectivePermissions(me))))
    return { error: "You can't change your own role or permissions." };

  const mine = effectivePermissions(me);
  const tooFar = next.permissions.filter((p) => !mine.includes(p));
  if (tooFar.length)
    return {
      error: FIX_FIELDS,
      fieldErrors: { permissions: "You can only grant permissions that you hold yourself" },
    };

  return null;
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/** Fields the form owns. Everything else on the document is left alone. */
function managedFields(data: CleanUser) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    // Same string values as the Role union; the enum is what mongoose's types want
    role: data.role as UserRole,
    permissions: data.permissions,
    isActive: data.isActive,
  };
}

export async function createUser(payload: unknown): Promise<UserResult> {
  const me = await actor();
  if (!me) return { ok: false, error: NOT_ALLOWED };

  const wantsPassword =
    !!payload && typeof payload === "object" && (payload as { role?: unknown }).role !== "user";

  const result = validateUser(payload, { mode: "create", requirePassword: wantsPassword });
  if (!result.ok) return { ok: false, error: FIX_FIELDS, fieldErrors: result.errors };
  const data = result.data;

  const blocked = checkEscalation(me, { role: data.role, permissions: data.permissions });
  if (blocked) return { ok: false, ...blocked };

  try {
    await dbConnect();

    if (await User.exists({ phone: data.phone }))
      return { ok: false, error: FIX_FIELDS, fieldErrors: { phone: "Another account already uses this number" } };
    if (data.email && (await User.exists({ email: data.email })))
      return { ok: false, error: FIX_FIELDS, fieldErrors: { email: "Another account already uses this email" } };

    const created = await User.create({
      ...managedFields(data),
      // Staff sign in with a password; customers use OTP and keep it unset.
      ...(data.password ? { password: await bcryptjs.hash(data.password, 12) } : {}),
      isPhoneVerified: false,
      isEmailVerified: false,
    });

    revalidateUsers();
    return { ok: true, data: { id: String(created._id) } };
  } catch (error) {
    if (isDuplicateKey(error)) return duplicateFieldError(error);
    console.error("[createUser]", error);
    return { ok: false, error: GENERIC };
  }
}

export async function updateUser(
  userId: string,
  payload: unknown,
  expectedUpdatedAt?: string,
): Promise<UserResult> {
  const me = await actor();
  if (!me) return { ok: false, error: NOT_ALLOWED };
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId))
    return { ok: false, error: "Invalid user id." };

  const result = validateUser(payload, { mode: "edit" });
  if (!result.ok) return { ok: false, error: FIX_FIELDS, fieldErrors: result.errors };
  const data = result.data;

  try {
    await dbConnect();
    const target = await User.findById(userId).select("role permissions phone email updatedAt").lean();
    if (!target) return { ok: false, error: "This account no longer exists." };

    if (
      expectedUpdatedAt &&
      target.updatedAt &&
      new Date(target.updatedAt).toISOString() !== expectedUpdatedAt
    )
      return {
        ok: false,
        error:
          "This account was changed somewhere else since you opened it. Reload the page to get the latest version.",
      };

    const blocked = checkEscalation(
      me,
      { role: data.role, permissions: data.permissions },
      { _id: target._id, role: target.role },
    );
    if (blocked) return { ok: false, ...blocked };

    // Don't let the last active admin be demoted or switched off
    if (target.role === "admin" && (data.role !== "admin" || !data.isActive)) {
      const others = await User.countDocuments({
        _id: { $ne: target._id },
        role: UserRole.ADMIN,
        isActive: true,
      });
      if (others === 0)
        return { ok: false, error: "This is the last active administrator. Promote someone else first." };
    }

    if (data.phone !== target.phone && (await User.exists({ phone: data.phone, _id: { $ne: target._id } })))
      return { ok: false, error: FIX_FIELDS, fieldErrors: { phone: "Another account already uses this number" } };
    if (data.email && data.email !== target.email && (await User.exists({ email: data.email, _id: { $ne: target._id } })))
      return { ok: false, error: FIX_FIELDS, fieldErrors: { email: "Another account already uses this email" } };

    // Clearing a field has to be an $unset, not $set: undefined — otherwise the
    // sparse unique index on email keeps the old value.
    const { name, email, ...rest } = managedFields(data);
    const unset: Record<string, ""> = {};
    if (!name) unset.name = "";
    if (!email) unset.email = "";

    await User.updateOne(
      { _id: target._id },
      {
        $set: { ...rest, ...(name ? { name } : {}), ...(email ? { email } : {}) },
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      },
      { runValidators: true },
    );

    revalidateUsers();
    return { ok: true, data: { id: userId } };
  } catch (error) {
    if (isDuplicateKey(error)) return duplicateFieldError(error);
    console.error("[updateUser]", error);
    return { ok: false, error: GENERIC };
  }
}

/** Replaces a user's permission list without touching anything else. */
export async function setUserPermissions(
  userId: string,
  permissions: unknown,
): Promise<ActionResult<{ permissions: Permission[] }>> {
  const me = await actor();
  if (!me) return { ok: false, error: NOT_ALLOWED };
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId))
    return { ok: false, error: "Invalid user id." };
  if (!Array.isArray(permissions) || permissions.some((p) => !isPermission(p)))
    return { ok: false, error: "Unknown permission." };

  const next = sanitizePermissions(permissions);

  try {
    await dbConnect();
    const target = await User.findById(userId).select("role").lean();
    if (!target) return { ok: false, error: "This account no longer exists." };

    const blocked = checkEscalation(me, { role: target.role, permissions: next }, { _id: target._id, role: target.role });
    if (blocked) return { ok: false, error: blocked.error };

    if (target.role === "admin")
      return { ok: false, error: "Administrators already hold every permission." };
    if (target.role === "user")
      return { ok: false, error: "Make this account staff before giving it admin modules." };

    await User.updateOne({ _id: target._id }, { $set: { permissions: next } });
    revalidateUsers();
    return { ok: true, data: { permissions: next } };
  } catch (error) {
    console.error("[setUserPermissions]", error);
    return { ok: false, error: GENERIC };
  }
}

export async function setUserActive(
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const me = await actor();
  if (!me) return { ok: false, error: NOT_ALLOWED };
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId) || typeof isActive !== "boolean")
    return { ok: false, error: "Invalid request." };
  if (userId === me.id) return { ok: false, error: "You can't deactivate your own account." };

  try {
    await dbConnect();
    const target = await User.findById(userId).select("role").lean();
    if (!target) return { ok: false, error: "This account no longer exists." };

    if (target.role === "admin" && me.role !== "admin")
      return { ok: false, error: "Only an administrator can change an administrator's account." };

    if (target.role === "admin" && !isActive) {
      const others = await User.countDocuments({ _id: { $ne: target._id }, role: UserRole.ADMIN, isActive: true });
      if (others === 0)
        return { ok: false, error: "This is the last active administrator." };
    }

    await User.updateOne({ _id: target._id }, { $set: { isActive } });
    revalidateUsers();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[setUserActive]", error);
    return { ok: false, error: GENERIC };
  }
}

/**
 * Hard delete. Refused when the account has orders attached — those would be
 * orphaned, so the caller is told to deactivate instead.
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const me = await actor();
  if (!me) return { ok: false, error: NOT_ALLOWED };
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId))
    return { ok: false, error: "Invalid user id." };
  if (userId === me.id) return { ok: false, error: "You can't delete your own account." };

  try {
    await dbConnect();
    const target = await User.findById(userId).select("role").lean();
    if (!target) return { ok: false, error: "This account was already deleted." };

    if (target.role === "admin" && me.role !== "admin")
      return { ok: false, error: "Only an administrator can delete an administrator." };

    if (target.role === "admin") {
      const others = await User.countDocuments({ _id: { $ne: target._id }, role: UserRole.ADMIN, isActive: true });
      if (others === 0) return { ok: false, error: "This is the last active administrator." };
    }

    const orders = await Order.countDocuments({ user: target._id });
    if (orders > 0)
      return {
        ok: false,
        error: `This account has ${orders} order${orders === 1 ? "" : "s"} attached. Deactivate it instead so the order history stays intact.`,
      };

    await User.deleteOne({ _id: target._id });
    revalidateUsers();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteUser]", error);
    return { ok: false, error: "Couldn't delete the account. Please try again." };
  }
}

/** Sets a new password for a staff/admin account. */
export async function setUserPassword(
  userId: string,
  password: unknown,
): Promise<ActionResult> {
  const me = await actor();
  if (!me) return { ok: false, error: NOT_ALLOWED };
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId))
    return { ok: false, error: "Invalid user id." };
  if (typeof password !== "string" || password.length < 8 || password.length > 72)
    return { ok: false, error: "Password must be between 8 and 72 characters." };

  try {
    await dbConnect();
    const target = await User.findById(userId).select("role").lean();
    if (!target) return { ok: false, error: "This account no longer exists." };

    if (target.role === "admin" && me.role !== "admin")
      return { ok: false, error: "Only an administrator can change an administrator's password." };
    if (target.role === "user")
      return { ok: false, error: "Customer accounts sign in with a one-time code, not a password." };

    await User.updateOne({ _id: target._id }, { $set: { password: await bcryptjs.hash(password, 12) } });
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[setUserPassword]", error);
    return { ok: false, error: GENERIC };
  }
}
