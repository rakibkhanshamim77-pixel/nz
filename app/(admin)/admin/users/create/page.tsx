import type { Metadata } from "next";
import { guardPage } from "@/app/utils/authz";
import { effectivePermissions, type Role } from "@/db/permissions";
import AdminTopbar from "../../../_components/AdminTopbar";
import AdminBreadcrumb from "../../../_components/AdminBreadcrumb";
import UserForm from "../_components/form/UserForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add User – Neeshanz Admin" };

export default async function CreateUserPage() {
  const user = await guardPage("user_management");

  return (
    <div>
      <AdminTopbar
        title="Add New User"
        subtitle="Create a staff or customer account"
        backHref="/admin/users"
        userName={user.name}
        userRole={user.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: "Add New" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: "Add New" },
          ]}
        />
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-[1.9rem] sm:text-4xl tracking-tight leading-tight">
            Add New User
          </h1>
          <p className="text-sm text-[var(--mute)] mt-1">
            Fields marked * are required. The mobile number is the login identity.
          </p>
        </div>

        <UserForm
          mode="create"
          viewer={{
            id: user.id,
            role: user.role as Role,
            permissions: effectivePermissions(user),
          }}
        />
      </main>
    </div>
  );
}
