export const dynamic = "force-dynamic";

import AdminTopbar from "@/app/(admin)/_components/AdminTopbar";
import AdminBreadcrumb from "@/app/(admin)/_components/AdminBreadcrumb";
import { guardPage } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import User, { UserRole } from "@/db/models/User";
import Order from "@/db/models/Order";
import CustomersTable, { type CustomerRow } from "./_components/CustomersTable";
import CustomersPagination from "../users/_components/UsersPagination";
import mongoose from "mongoose";

const PER_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PER = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; per?: string };
}) {
  await guardPage("customers_management");
  await dbConnect();

  const q = searchParams.q?.trim() || "";
  const per = PER_OPTIONS.includes(Number(searchParams.per))
    ? Number(searchParams.per)
    : DEFAULT_PER;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const filter: Record<string, unknown> = { role: UserRole.USER };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const [users, total, totalCustomers, activeToday, newThisWeek] =
    await Promise.all([
      User.find(filter)
        .select("name phone email isActive lastLogin createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * per)
        .limit(per)
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ role: UserRole.USER }),
      User.countDocuments({
        role: UserRole.USER,
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      User.countDocuments({
        role: UserRole.USER,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

  const userIds = users.map((u) => u._id as mongoose.Types.ObjectId);
  const orderStats = await Order.aggregate([
    { $match: { user: { $in: userIds } } },
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
      },
    },
  ]);

  const statsMap = new Map<
    string,
    { orderCount: number; totalSpent: number }
  >();
  for (const s of orderStats) {
    statsMap.set(String(s._id), {
      orderCount: s.orderCount,
      totalSpent: s.totalSpent,
    });
  }

  const customers: CustomerRow[] = users.map((u) => {
    const stats = statsMap.get(String(u._id)) || {
      orderCount: 0,
      totalSpent: 0,
    };
    return {
      _id: String(u._id),
      name: u.name,
      phone: u.phone,
      email: u.email,
      isActive: u.isActive,
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent,
      lastLogin: u.lastLogin ? u.lastLogin.toISOString() : undefined,
      createdAt: u.createdAt
        ? u.createdAt.toISOString()
        : new Date().toISOString(),
    };
  });

  const stats = [
    {
      label: "মোট কাস্টমার",
      value: totalCustomers.toLocaleString(),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <circle cx={9} cy={8} r="3.5" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
        </svg>
      ),
      accent: "#6366f1",
      accentBg: "color-mix(in srgb,#6366f1 10%,transparent)",
    },
    {
      label: "আজ সক্রিয়",
      value: activeToday.toLocaleString(),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      accent: "#22c55e",
      accentBg: "color-mix(in srgb,#22c55e 10%,transparent)",
    },
    {
      label: "নতুন এই সপ্তাহে",
      value: newThisWeek.toLocaleString(),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      accent: "#f59e0b",
      accentBg: "color-mix(in srgb,#f59e0b 10%,transparent)",
    },
    {
      label: "মোট পেজ",
      value: (Math.ceil(total / per) || 1).toLocaleString(),
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
      ),
      accent: "#ec4899",
      accentBg: "color-mix(in srgb,#ec4899 10%,transparent)",
    },
  ];

  return (
    <>
      <AdminTopbar />
      <main className="p-8">
        <AdminBreadcrumb items={[{ label: "Customers" }]} />

        {/* Page header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Customer Management
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
              সকল কাস্টমার অ্যাকাউন্ট দেখুন ও পরিচালনা করুন
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border p-5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide mb-2"
                    style={{ color: "var(--mute)" }}
                  >
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: s.accent }}>
                    {s.value}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.accentBg, color: s.accent }}
                >
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <CustomersTable
          customers={customers}
          total={total}
          search={q}
        />
        <CustomersPagination total={total} page={page} per={per} />
      </main>
    </>
  );
}
