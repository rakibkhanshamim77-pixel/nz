import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/app/utils/getUser";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import User from "@/db/models/User";
import AccountHeader from "./_components/AccountHeader";
import AccountSidebar from "./_components/AccountSidebar";
import AccountDashboard from "./_components/AccountDashboard";
import AccountOrders from "./_components/AccountOrders";
import AccountProfile from "./_components/AccountProfile";
import AccountAddresses from "./_components/AccountAddresses";
import AccountSettings from "./_components/AccountSettings";
import type {
  AccountOrder,
  AccountAddress,
  AccountStats,
} from "./_components/account.types";

export const metadata: Metadata = {
  title: "আমার অ্যাকাউন্ট – Neeshanz",
  description: "আপনার অর্ডার, প্রোফাইল এবং ঠিকানা পরিচালনা করুন।",
};

const ACTIVE_STATUSES = new Set(["pending", "confirmed", "processing", "shipped"]);

export default async function MyAccountPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  let orders: AccountOrder[]   = [];
  let addresses: AccountAddress[] = [];
  let stats: AccountStats = { totalOrders: 0, activeOrders: 0, totalItems: 0, totalSpent: 0 };

  try {
    await dbConnect();

    /* ── Orders ── */
    const rawOrders = await Order.find({
      "customer.phone": { $regex: user.phone, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "orderNumber status createdAt items subtotal deliveryCharge discount totalAmount payment delivery customer",
      )
      .lean<Record<string, unknown>[]>();

    orders = rawOrders.map((o) => {
      const c   = (o.customer as Record<string, string>) ?? {};
      const pay = (o.payment  as Record<string, unknown>) ?? {};
      const del = (o.delivery as Record<string, unknown>) ?? {};
      const its = (o.items    as Record<string, unknown>[]) ?? [];

      return {
        orderNumber:    o.orderNumber as string,
        status:         o.status      as string,
        createdAt:      String(o.createdAt),
        subtotal:       (o.subtotal       as number) ?? 0,
        deliveryCharge: (o.deliveryCharge as number) ?? 0,
        discount:       (o.discount       as number) ?? 0,
        totalAmount:    (o.totalAmount    as number) ?? 0,
        payment: {
          method:        pay.method        as string,
          transactionId: pay.transactionId as string | undefined,
          gateway:       pay.gateway       as string | undefined,
        },
        delivery: {
          courier:        del.courier        as string | undefined,
          trackingNumber: del.trackingNumber as string | undefined,
        },
        customer: {
          name:     c.name,
          phone:    c.phone,
          address:  c.address,
          district: c.district,
          division: c.division,
        },
        items: its.map((i) => ({
          name:       i.name       as string,
          slug:       i.slug       as string | undefined,
          image:      (i.image     as string) || undefined,
          size:       i.size       as string | undefined,
          color:      i.color      as string | undefined,
          quantity:   i.quantity   as number,
          unitPrice:  i.unitPrice  as number,
          totalPrice: i.totalPrice as number,
        })),
      };
    });

    stats = {
      totalOrders:  orders.length,
      activeOrders: orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length,
      totalItems:   orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0),
      totalSpent:   orders.reduce((s, o) => s + o.totalAmount, 0),
    };

    /* ── Addresses ── */
    const fullUser = await User.findById(user.id).select("addresses").lean();
    addresses = ((fullUser?.addresses as unknown as Record<string, unknown>[]) ?? []).map((a) => ({
      _id:       String(a._id),
      label:     a.label     as string,
      name:      a.name      as string,
      phone:     a.phone     as string,
      address:   a.address   as string,
      district:  (a.district as string) || "",
      city:      (a.city     as string) || "",
      isDefault: a.isDefault as boolean,
    }));
  } catch (err) {
    console.error("[MyAccountPage] DB error:", err);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
      <AccountHeader user={user} />

      <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        <AccountSidebar orderCount={orders.length} addressCount={addresses.length} />

        <div className="space-y-6">
          <AccountDashboard stats={stats} />
          <AccountOrders orders={orders} />
          <AccountProfile user={user} />
          <AccountAddresses addresses={addresses} />
          <AccountSettings />
        </div>
      </div>
    </main>
  );
}
