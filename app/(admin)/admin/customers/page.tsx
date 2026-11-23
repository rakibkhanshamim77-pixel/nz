export const dynamic = "force-dynamic";

import AdminTopbar from "@/app/(admin)/_components/AdminTopbar";
import AdminBreadcrumb from "@/app/(admin)/_components/AdminBreadcrumb";
import { guardPage } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import CustomersTable, { type CustomerRow } from "./_components/CustomersTable";
import CustomersPagination from "../users/_components/UsersPagination";
import SendMessageModal from "./_components/SendMessageModal";

const PER_OPTIONS = [10, 20, 50];
const DEFAULT_PER = 20;

interface CustomerAgg {
  _id: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date;
}

interface CountAgg { total: number }

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; per?: string };
}) {
  await guardPage("customers_management");
  await dbConnect();

  const q = searchParams.q?.trim() || "";
  const per = PER_OPTIONS.includes(Number(searchParams.per)) ? Number(searchParams.per) : DEFAULT_PER;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  // Build match stage for search
  const matchStage = q
    ? {
        $match: {
          $or: [
            { "customer.phone": { $regex: q, $options: "i" } },
            { "customer.name": { $regex: q, $options: "i" } },
          ],
        },
      }
    : null;

  const groupStage = {
    $group: {
      _id: { $toLower: "$customer.phone" },
      name: { $first: "$customer.name" },
      phone: { $first: "$customer.phone" },
      orderCount: { $sum: 1 },
      totalSpent: { $sum: "$totalAmount" },
      lastOrderAt: { $max: "$createdAt" },
    },
  };

  const basePipeline = [
    ...(matchStage ? [matchStage] : []),
    groupStage,
  ];

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dayAgo  = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [rows, countResult, totalUnique, newThisWeek, activeToday] = await Promise.all([
    Order.aggregate<CustomerAgg>([
      ...basePipeline,
      { $sort: { lastOrderAt: -1 } },
      { $skip: (page - 1) * per },
      { $limit: per },
    ]),
    Order.aggregate<CountAgg>([...basePipeline, { $count: "total" }]),
    Order.aggregate<CountAgg>([{ $group: { _id: "$customer.phone" } }, { $count: "total" }]),
    Order.aggregate<CountAgg>([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: "$customer.phone" } },
      { $count: "total" },
    ]),
    Order.aggregate<CountAgg>([
      { $match: { createdAt: { $gte: dayAgo } } },
      { $group: { _id: "$customer.phone" } },
      { $count: "total" },
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;
  const totalCustomers = totalUnique[0]?.total ?? 0;

  const customers: CustomerRow[] = rows.map((r) => ({
    _id: r._id,
    name: r.name,
    phone: r.phone,
    orderCount: r.orderCount,
    totalSpent: r.totalSpent,
    lastOrderAt: r.lastOrderAt ? r.lastOrderAt.toISOString() : undefined,
  }));

  const statCards = [
    {
      label: "মোট কাস্টমার",
      value: totalCustomers.toLocaleString(),
      accent: "#6366f1",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <circle cx={9} cy={8} r="3.5" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
        </svg>
      ),
    },
    {
      label: "আজ অর্ডার করেছেন",
      value: (activeToday[0]?.total ?? 0).toLocaleString(),
      accent: "#22c55e",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      label: "নতুন এই সপ্তাহে",
      value: (newThisWeek[0]?.total ?? 0).toLocaleString(),
      accent: "#f59e0b",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      label: "মোট পেজ",
      value: (Math.ceil(total / per) || 1).toLocaleString(),
      accent: "#ec4899",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <AdminTopbar />
      <main className="p-8">
        <AdminBreadcrumb items={[{ label: "Customers" }]} />

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              কাস্টমার ম্যানেজমেন্ট
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
              অর্ডার করা সকল কাস্টমার — ফোন নম্বর অনুযায়ী
            </p>
          </div>
          <SendMessageModal totalCustomers={totalCustomers} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--mute)" }}>
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: s.accent }}>
                    {s.value}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb,${s.accent} 10%,transparent)`, color: s.accent }}
                >
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <CustomersTable customers={customers} total={total} search={q} />
        <CustomersPagination total={total} page={page} per={per} />
      </main>
    </>
  );
}
