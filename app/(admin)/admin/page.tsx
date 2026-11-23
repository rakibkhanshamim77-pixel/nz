import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import Product from "@/db/models/Product";
import { guardPageAny } from "@/app/utils/authz";
import { userHasPermission } from "@/db/permissions";
import { getLowStockThreshold } from "@/db/settings.server";
import AdminTopbar from "../_components/AdminTopbar";
import DashboardKPIs from "./_components/DashboardKPIs";
import DashboardChart, { ChartDay } from "./_components/DashboardChart";
import DashboardOrderStatus from "./_components/DashboardOrderStatus";
import DashboardVerifyPayments from "./_components/DashboardVerifyPayments";
import DashboardLowStock from "./_components/DashboardLowStock";

import DashboardTopProducts from "./_components/DashboardTopProducts";

import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  range?: string;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const range = Math.min(
    90,
    Math.max(7, parseInt(searchParams.range ?? "7", 10) || 7),
  );

  // The dashboard mixes order and product data, so each block is gated separately
  // below. Holding neither module sends you to your own first allowed page.
  const user = await guardPageAny(["order_management", "product_management"]);
  const canOrders = userHasPermission(user, "order_management");
  const canProducts = userHasPermission(user, "product_management");

  const lowStockThreshold = await getLowStockThreshold();
  await dbConnect();

  const now = Date.now();
  const startDate = new Date(now - range * 86400000);
  const prevStartDate = new Date(now - range * 2 * 86400000);

  const [
    // KPI: current period revenue + orders (delivered only for revenue)
    currentRevenueAgg,
    prevRevenueAgg,
    currentOrderCount,
    prevOrderCount,
    // New customers (unique phones in period)
    currentCustomers,
    prevCustomers,
    // Daily chart data
    chartAgg,
    // Status breakdown (all orders)
    statusAgg,
    // Pending payments (up to 10)
    pendingPaymentOrders,
    // Low stock products
    lowStockProducts,
    // Top 5 products by qty sold in period
    topProductsAgg,
    // Quick action counts
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: "delivered", createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: prevStartDate, $lt: startDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startDate } }),
    Order.countDocuments({
      createdAt: { $gte: prevStartDate, $lt: startDate },
    }),
    Order.distinct("customer.phone", { createdAt: { $gte: startDate } }),
    Order.distinct("customer.phone", {
      createdAt: { $gte: prevStartDate, $lt: startDate },
    }),
    // Chart: group by date string
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Status breakdown
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    // Pending payments: orders with payment.status = pending
    Order.find({ "payment.status": "pending" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "orderNumber customer.name customer.phone totalAmount payment.gateway payment.transactionId payment.senderAccount payment.submittedAt",
      )
      .lean(),
    // Low stock (at or below the configured threshold, active)
    Product.find({ stock: { $lte: lowStockThreshold }, isActive: true })
      .sort({ stock: 1 })
      .limit(8)
      .select("name slug images stock salePrice")
      .lean(),
    // Top products by qty sold in period
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.slug",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    // Quick action counts
    Order.countDocuments({ "payment.status": "pending" }),
    Product.countDocuments({ stock: { $lte: lowStockThreshold }, isActive: true }),
    Order.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
  ]);

  // — KPI derived values —
  const revenue: number = currentRevenueAgg[0]?.total ?? 0;
  const prevRevenue: number = prevRevenueAgg[0]?.total ?? 0;
  const avgOrderValue = currentOrderCount > 0 ? revenue / currentOrderCount : 0;
  const prevAvgOrderValue =
    prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

  // — Fill missing chart days —
  const chartMap = new Map<string, { sales: number; orders: number }>(
    chartAgg.map((d: { _id: string; sales: number; orders: number }) => [
      d._id,
      { sales: d.sales, orders: d.orders },
    ]),
  );
  const chartData: ChartDay[] = [];
  for (let i = 0; i < range; i++) {
    const d = new Date(startDate.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const v = chartMap.get(iso) ?? { sales: 0, orders: 0 };
    chartData.push({ date: iso, ...v });
  }

  // — Status breakdown —
  const STATUS_LABEL: Record<string, string> = {
    pending: "Payment pending",
    confirmed: "Confirmed",
    processing: "Packing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  const STATUS_ORDER = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const statusMap = new Map<string, number>(
    statusAgg.map((s: { _id: string; count: number }) => [s._id, s.count]),
  );
  const statusRows = STATUS_ORDER.map((s) => ({
    status: s,
    count: statusMap.get(s) ?? 0,
    label: STATUS_LABEL[s] ?? s,
  }));

  // — Serialize pending payments —
  const pendingPayments = pendingPaymentOrders.map((o) => ({
    orderId: String(o._id),
    orderNumber: o.orderNumber ?? "",
    customerName: o.customer.name ?? "",
    customerPhone: o.customer.phone ?? "",
    amount: o.totalAmount ?? 0,
    gateway: o.payment.gateway ?? "",
    transactionId: o.payment.transactionId ?? undefined,
    senderAccount: o.payment.senderAccount ?? undefined,
    submittedAt: o.payment.submittedAt
      ? new Date(o.payment.submittedAt as Date).toISOString()
      : undefined,
  }));

  // — Serialize low stock —
  const lowStock = lowStockProducts.map((p) => ({
    id: String(p._id),
    slug: p.slug as string,
    name: p.name as string,
    image: (p.images as string[])?.[0] ?? undefined,
    stock: p.stock as number,
    price: p.salePrice as number,
  }));

  // — Top products —
  const topProducts = topProductsAgg.map(
    (p: {
      _id: string;
      name: string;
      image?: string;
      sold: number;
      revenue: number;
    }) => ({
      slug: p._id,
      name: p.name,
      image: p.image,
      sold: p.sold,
      revenue: p.revenue,
    }),
  );

  return (
    <div>
      <AdminTopbar
        title="Dashboard"
        subtitle={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
        userName={user?.name}
        userRole={user?.role}
        notificationCount={pendingPaymentOrders.length}
        breadcrumb={[{ label: "Dashboard" }]}
        actions={
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--soft)]">
            {[7, 30, 90].map((r) => (
              <Link
                key={r}
                href={`/admin?range=${r}`}
                aria-pressed={range === r ? "true" : "false"}
                className="chip"
              >
                {r}d
              </Link>
            ))}
          </div>
        }
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        {canOrders && (
          <>
            {/* KPIs */}
            <DashboardKPIs
              revenue={revenue}
              prevRevenue={prevRevenue}
              orderCount={currentOrderCount}
              prevOrderCount={prevOrderCount}
              avgOrderValue={avgOrderValue}
              prevAvgOrderValue={prevAvgOrderValue}
              newCustomers={currentCustomers.length}
              prevNewCustomers={prevCustomers.length}
              range={range}
            />

            {/* Chart + Order Status */}
            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 mb-5">
              <DashboardChart data={chartData} range={range} />
              <DashboardOrderStatus rows={statusRows} />
            </div>

            {/* Verify Payments */}
            <div className="mb-5">
              <DashboardVerifyPayments payments={pendingPayments} />
            </div>
          </>
        )}

        {canProducts && (
          <div className="grid md:grid-cols-2 gap-5">
            <DashboardTopProducts products={topProducts} range={range} />
            <DashboardLowStock products={lowStock} />
          </div>
        )}
      </main>
    </div>
  );
}
