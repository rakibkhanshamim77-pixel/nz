import type { Metadata } from "next";
import Link from "next/link";
import mongoose from "mongoose";
import { guardPage } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import User from "@/db/models/User";
import { effectivePermissions, sanitizePermissions, type Role } from "@/db/permissions";
import AdminTopbar from "../../../../_components/AdminTopbar";
import AdminBreadcrumb from "../../../../_components/AdminBreadcrumb";
import UserForm from "../../_components/form/UserForm";
import { UserStatusBadge } from "../../_components/UserBadges";
import { statusOf } from "../../_components/types";
import type { UserFormInitial } from "../../_components/form/userFormTypes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit User – Neeshanz Admin" };

async function loadUser(userId: string): Promise<UserFormInitial | null> {
  if (!mongoose.isValidObjectId(userId)) return null;
  await dbConnect();

  // `password` is select:false on the schema; named explicitly so it stays out
  const u = await User.findById(userId)
    .select("name email phone profileImage role permissions isActive isPhoneVerified createdAt updatedAt lastLogin")
    .lean();
  if (!u) return null;

  return {
    id: String(u._id),
    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : "",
    name: u.name ?? "",
    email: u.email ?? "",
    phone: u.phone,
    profileImage: u.profileImage ?? "",
    role: u.role as Role,
    permissions: sanitizePermissions(u.permissions),
    isActive: u.isActive !== false,
    isPhoneVerified: !!u.isPhoneVerified,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
    lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : null,
  };
}

function UserNotFound() {
  return (
    <section className="card p-10 sm:p-14 text-center max-w-xl mx-auto mt-6">
      <div className="w-14 h-14 rounded-2xl bg-[var(--soft)] grid place-items-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-[var(--mute)]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-2xl">User not found</h1>
      <p className="text-sm text-[var(--mute)] mt-2">
        This account doesn&apos;t exist or was deleted. Check the link, or pick someone from the
        list.
      </p>
      <Link href="/admin/users" className="btn-solid mt-6 inline-flex">
        Back to users
      </Link>
    </section>
  );
}

export default async function EditUserPage({ params }: { params: { userId: string } }) {
  const viewer = await guardPage("user_management");
  const target = await loadUser(params.userId);

  return (
    <div>
      <AdminTopbar
        title={target ? "Edit User" : "User not found"}
        subtitle={target?.name || target?.phone}
        backHref="/admin/users"
        userName={viewer.name}
        userRole={viewer.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: target ? (target.name || target.phone || "Edit") : "Edit" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: target ? (target.name || target.phone || "Edit") : "Edit" },
          ]}
        />
        {target ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div className="min-w-0">
                <h1 className="font-display font-extrabold text-[1.9rem] sm:text-4xl tracking-tight leading-tight flex flex-wrap items-center gap-3">
                  <span className="truncate">{target.name || target.phone}</span>
                  <UserStatusBadge
                    status={statusOf({
                      isActive: target.isActive,
                      isPhoneVerified: target.isPhoneVerified,
                    })}
                  />
                </h1>
                <p className="text-sm text-[var(--mute)] mt-1">
                  {target.id === viewer.id
                    ? "This is your own account — role and permissions are locked."
                    : "Changes take effect the next time they load a page."}
                </p>
              </div>
            </div>

            <UserForm
              mode="edit"
              initial={target}
              viewer={{
                id: viewer.id,
                role: viewer.role as Role,
                permissions: effectivePermissions(viewer),
              }}
            />
          </>
        ) : (
          <UserNotFound />
        )}
      </main>
    </div>
  );
}
