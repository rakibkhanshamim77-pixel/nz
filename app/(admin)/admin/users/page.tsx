import type { Metadata } from "next";
import Link from "next/link";
import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import User, { UserRole } from "@/db/models/User";
import { guardPage } from "@/app/utils/authz";
import { effectivePermissions, isRole, sanitizePermissions, type Role } from "@/db/permissions";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import UsersStats from "./_components/UsersStats";
import UsersFilters from "./_components/UsersFilters";
import UsersTable from "./_components/UsersTable";
import UsersMobileCards from "./_components/UsersMobileCards";
import UsersPagination from "./_components/UsersPagination";
import type { UserRow, UserTypeTab } from "./_components/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Users – Neeshanz Admin" };

interface SearchParams {
  q?: string;
  role?: string;
  status?: string;
  reg?: string;
  type?: string;
  page?: string;
  per?: string;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const STAFF_ROLES = [UserRole.ADMIN, UserRole.MODERATOR];

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const me = await guardPage("user_management");

  const q = searchParams.q?.trim().slice(0, 100) ?? "";
  const roleParam = searchParams.role ?? "";
  const status = searchParams.status ?? "";
  const reg = searchParams.reg ?? "";
  const type = (["staff", "customers"].includes(searchParams.type ?? "")
    ? searchParams.type
    : "all") as UserTypeTab;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const per = [5, 10, 20, 50].includes(parseInt(searchParams.per ?? "10", 10))
    ? parseInt(searchParams.per ?? "10", 10)
    : 10;

  await dbConnect();

  const filter: Record<string, unknown> = {};

  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: re }, { email: re }, { phone: re }];
  }

  if (status === "active") Object.assign(filter, { isActive: true, isPhoneVerified: true });
  else if (status === "inactive") filter.isActive = false;
  else if (status === "pending") Object.assign(filter, { isActive: true, isPhoneVerified: false });

  const regDays = parseInt(reg, 10);
  if ([7, 30, 90, 365].includes(regDays))
    filter.createdAt = { $gte: new Date(Date.now() - regDays * 86_400_000) };

  // The role select and the type tab both narrow by role, so intersect them
  // instead of letting one overwrite the other.
  const roleScope: UserRole[] =
    type === "staff" ? STAFF_ROLES : type === "customers" ? [UserRole.USER] : [];
  const picked = isRole(roleParam) ? (roleParam as UserRole) : null;

  if (picked && roleScope.length) filter.role = roleScope.includes(picked) ? picked : { $in: [] };
  else if (picked) filter.role = picked;
  else if (roleScope.length) filter.role = { $in: roleScope };

  const [total, staffCount, activeCount, pendingCount, filteredCount, docs] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: { $in: STAFF_ROLES } }),
    User.countDocuments({ isActive: true, isPhoneVerified: true }),
    User.countDocuments({ isActive: true, isPhoneVerified: false }),
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per)
      .limit(per)
      // password is select:false in the schema; listed explicitly for clarity
      .select("name email phone role permissions isActive isPhoneVerified profileImage createdAt lastLogin")
      .lean(),
  ]);

  // One aggregate for the whole page instead of a query per row
  const ids = docs.map((d) => d._id as mongoose.Types.ObjectId);
  const orderCounts = ids.length
    ? await Order.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $match: { user: { $in: ids } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ])
    : [];
  const ordersBy = new Map(orderCounts.map((o) => [String(o._id), o.count]));

  const rows: UserRow[] = docs.map((u) => {
    const role = (isRole(u.role) ? u.role : "user") as Role;
    return {
      id: String(u._id),
      name: u.name ?? "",
      email: u.email ?? "",
      phone: u.phone,
      role,
      permissions: sanitizePermissions(u.permissions),
      effectivePermissions: effectivePermissions({ role, permissions: u.permissions }),
      isActive: u.isActive !== false,
      isPhoneVerified: !!u.isPhoneVerified,
      profileImage: u.profileImage ?? "",
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : null,
      orderCount: ordersBy.get(String(u._id)) ?? 0,
    };
  });

  const customerCount = Math.max(0, total - staffCount);
  const hasFilters = !!(q || roleParam || status || reg || type !== "all");

  return (
    <div>
      <AdminTopbar
        title="Users"
        subtitle="Staff accounts, customers and who can access what"
        userName={me.name}
        userRole={me.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Users" },
        ]}
        actions={
          <Link href="/admin/users/create" className="btn-solid !h-10 !px-3 sm:!px-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx={10} cy={8} r={4} />
              <path d="M2 21a8 8 0 0 1 13-6.2M19 15v6M16 18h6" />
            </svg>
            <span className="hidden sm:inline">Add New User</span>
            <span className="sr-only sm:hidden">Add new user</span>
          </Link>
        }
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Users" },
          ]}
        />

        <UsersStats total={total} staff={staffCount} active={activeCount} pending={pendingCount} />

        <UsersFilters
          total={total}
          filtered={filteredCount}
          staffCount={staffCount}
          customerCount={customerCount}
        />

        <UsersTable users={rows} currentUserId={me.id} currentUserRole={me.role} />
        <UsersMobileCards users={rows} currentUserId={me.id} currentUserRole={me.role} />

        {rows.length === 0 && (
          <section className="card p-10 text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--soft)] grid place-items-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={7} />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>
            <b className="font-display text-lg block">No users found</b>
            <p className="text-sm text-[var(--mute)] mt-1">
              {hasFilters
                ? "Try a different search or clear your filters."
                : "Add your first staff account to get started."}
            </p>
            <Link href="/admin/users/create" className="btn-solid mt-5 inline-flex">
              Add New User
            </Link>
          </section>
        )}

        <UsersPagination total={filteredCount} page={page} per={per} />
      </main>
    </div>
  );
}
