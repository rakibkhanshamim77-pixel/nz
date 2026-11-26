import { guardPage } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Coupon from "@/db/models/Coupon";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import CouponsStats from "./_components/CouponsStats";
import CouponsFilters from "./_components/CouponsFilters";
import CouponsManager from "./_components/CouponsManager";
import CouponsPagination from "./_components/CouponsPagination";
import { DEFAULT_LIMIT, type CouponRow } from "./_components/couponsConstants";

export const dynamic = "force-dynamic";

interface SearchParams {
  tab?: string;
  q?: string;
  page?: string;
  per?: string;
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await guardPage("coupon_management");

  const tab = (searchParams.tab ?? "") as "" | "active" | "inactive" | "expired";
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const per = [10, 15, 25, 50].includes(
    parseInt(searchParams.per ?? String(DEFAULT_LIMIT), 10),
  )
    ? parseInt(searchParams.per ?? String(DEFAULT_LIMIT), 10)
    : DEFAULT_LIMIT;
  const skip = (page - 1) * per;

  await dbConnect();

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (tab === "active") filter.isActive = true;
  if (tab === "inactive") filter.isActive = false;
  if (tab === "expired") filter.expiresAt = { $lt: new Date() };
  if (q) filter.code = { $regex: q, $options: "i" };

  const [coupons, total, statsActive, statsInactive, totalUsedAgg] =
    await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(per).lean(),
      Coupon.countDocuments(filter),
      Coupon.countDocuments({ isActive: true }),
      Coupon.countDocuments({ isActive: false }),
      Coupon.aggregate([{ $group: { _id: null, total: { $sum: "$usedCount" } } }]),
    ]);

  const totalUsed: number = totalUsedAgg[0]?.total ?? 0;
  const statsTotal = statsActive + statsInactive;

  const rows: CouponRow[] = coupons.map((c) => ({
    _id: String(c._id),
    code: c.code,
    type: c.type as "percentage" | "fixed",
    value: c.value,
    minOrderAmount: c.minOrderAmount ?? 0,
    maxUses: c.maxUses ?? null,
    usedCount: c.usedCount ?? 0,
    isActive: Boolean(c.isActive),
    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
    description: (c.description as string | undefined) ?? null,
    createdAt: c.createdAt ? new Date(c.createdAt as Date).toISOString() : "",
  }));

  return (
    <div>
      <AdminTopbar
        title="Coupons"
        subtitle="Create and manage discount coupons"
        userName={user?.name}
        userRole={user?.role}
        searchPlaceholder="Search coupons…"
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Coupons" },
        ]}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Coupons" },
          ]}
        />

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-[1.9rem] sm:text-4xl tracking-tight leading-tight">
              Coupons
            </h1>
            <p className="text-sm text-[var(--mute)] mt-1">
              Create and manage discount coupons.
            </p>
          </div>
        </div>

        <CouponsStats
          total={statsTotal}
          active={statsActive}
          inactive={statsInactive}
          totalUsed={totalUsed}
        />

        <CouponsFilters currentTab={tab} currentQ={q} total={total} />

        <CouponsManager coupons={rows} />

        <CouponsPagination total={total} page={page} per={per} />
      </main>
    </div>
  );
}
