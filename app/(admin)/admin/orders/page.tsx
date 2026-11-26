import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { guardPage } from "@/app/utils/authz";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import OrdersStats from "./_components/OrdersStats";
import OrdersFilters from "./_components/OrdersFilters";
import OrdersTable from "./_components/OrdersTable";
import OrdersMobileCards from "./_components/OrdersMobileCards";
import OrdersPagination from "./_components/OrdersPagination";
import { DEFAULT_LIMIT } from "./_components/ordersConstants";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  status?: string;
  payment?: string;
  page?: string;
  per?: string;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await guardPage("order_management");

  const q = (searchParams.q ?? "").trim();
  const status = searchParams.status ?? "";
  const payment = searchParams.payment ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const per = [10, 15, 25, 50].includes(parseInt(searchParams.per ?? "15", 10))
    ? parseInt(searchParams.per ?? "15", 10)
    : DEFAULT_LIMIT;
  const skip = (page - 1) * per;

  await dbConnect();

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (status) filter.status = status;
  if (payment) filter["payment.status"] = payment;
  if (q) {
    const re = new RegExp(q, "i");
    filter.$or = [
      { orderNumber: re },
      { "customer.name": re },
      { "customer.phone": re },
      { "payment.transactionId": re },
    ];
  }

  // Parallel queries
  const [
    orders,
    total,
    statsTotal,
    statsPendingPayment,
    statsConfirmed,
    statsProcessing,
    statsShipped,
    statsDelivered,
    revenueAgg,
  ] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per)
      .select(
        "orderNumber createdAt status customer.name customer.phone customer.district items.name payment.method payment.status payment.gateway payment.transactionId totalAmount",
      )
      .lean(),
    Order.countDocuments(filter),
    Order.countDocuments({}),
    Order.countDocuments({ "payment.status": "pending" }),
    Order.countDocuments({ status: "confirmed" }),
    Order.countDocuments({ status: "processing" }),
    Order.countDocuments({ status: "shipped" }),
    Order.countDocuments({ status: "delivered" }),
    Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  const revenue: number = revenueAgg[0]?.total ?? 0;

  // Serialize orders for client components
  const orderRows = orders.map((o) => ({
    _id: String(o._id),
    orderNumber: o.orderNumber,
    createdAt: o.createdAt!.toISOString(),
    status: o.status,
    customerName: o.customer.name,
    customerPhone: o.customer.phone,
    customerDistrict: o.customer.district,
    itemCount: o.items.length,
    itemNames: o.items
      .slice(0, 2)
      .map((i) => i.name)
      .join(", "),
    totalAmount: o.totalAmount,
    paymentMethod: o.payment.method,
    paymentStatus: o.payment.status,
    paymentGateway: o.payment.gateway,
    transactionId: o.payment.transactionId,
  }));

  return (
    <div>
      <AdminTopbar
        title="Orders"
        subtitle="Verify payments, update status and keep customers informed"
        userName={user?.name}
        userRole={user?.role}
        notificationCount={statsPendingPayment}
        searchPlaceholder="Search orders, customers, phone or TrxID…"
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Orders" },
        ]}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Orders" },
          ]}
        />
        <OrdersStats
          total={statsTotal}
          pendingPayment={statsPendingPayment}
          confirmed={statsConfirmed}
          processing={statsProcessing}
          shipped={statsShipped}
          delivered={statsDelivered}
          revenue={revenue}
        />

        <OrdersFilters
          currentStatus={status}
          currentPayment={payment}
          currentQ={q}
          total={total}
        />

        <OrdersTable orders={orderRows} />
        <OrdersMobileCards orders={orderRows} />

        <OrdersPagination total={total} page={page} per={per} />
      </main>
    </div>
  );
}
