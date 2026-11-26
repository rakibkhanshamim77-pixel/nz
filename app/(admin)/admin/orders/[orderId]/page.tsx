import { notFound } from "next/navigation";
import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { guardPage } from "@/app/utils/authz";
import AdminTopbar from "../../../_components/AdminTopbar";
import AdminBreadcrumb from "../../../_components/AdminBreadcrumb";
import { PROGRESS_STEPS, TERMINAL_STATUSES } from "./_component/orderConstants";
import OrderHeader from "./_component/OrderHeader";
import OrderStepper from "./_component/OrderStepper";
import OrderItems from "./_component/OrderItems";
import OrderTimeline from "./_component/OrderTimeline";
import OrderCustomerCard from "./_component/OrderCustomerCard";
import OrderDeliveryCard from "./_component/OrderDeliveryCard";
import OrderPaymentCard from "./_component/OrderPaymentCard";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  if (!mongoose.isValidObjectId(params.orderId)) notFound();

  const user = await guardPage("order_management");
  await dbConnect();
  const order = await Order.findById(params.orderId).lean();
  if (!order) notFound();

  const stepIndex = PROGRESS_STEPS.indexOf(
    order.status as (typeof PROGRESS_STEPS)[number]
  );
  const isTerminal = TERMINAL_STATUSES.includes(order.status);

  const serialized = JSON.parse(JSON.stringify(order));

  return (
    <div>
      <AdminTopbar
        title={`Order #${order.orderNumber}`}
        subtitle={`${order.customer.name} · ${order.customer.phone}`}
        backHref="/admin/orders"
        userName={user?.name}
        userRole={user?.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: `#${order.orderNumber}` },
        ]}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Orders", href: "/admin/orders" },
            { label: `#${order.orderNumber}` },
          ]}
        />
        <OrderHeader
          orderId={String(order._id)}
          orderNumber={order.orderNumber}
          createdAt={order.createdAt!}
          customerName={order.customer.name}
          customerPhone={order.customer.phone}
          status={order.status}
          paymentStatus={order.payment.status}
          totalAmount={order.totalAmount}
        />

        <OrderStepper
          orderId={String(order._id)}
          status={order.status}
          stepIndex={stepIndex}
          isTerminal={isTerminal}
          nextStatus={
            !isTerminal && stepIndex < PROGRESS_STEPS.length - 1
              ? PROGRESS_STEPS[stepIndex + 1]
              : null
          }
        />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
          {/* Left column */}
          <div className="space-y-5">
            <OrderItems
              items={order.items.map((item) => ({
                name: item.name,
                slug: item.slug,
                sku: item.sku,
                image: item.image,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                unitPrice: item.unitPrice,
              }))}
              subtotal={order.subtotal}
              deliveryCharge={order.deliveryCharge}
              discount={order.discount}
              totalAmount={order.totalAmount}
            />

            <OrderTimeline
              activities={(order.activities ?? []).map((act) => ({
                title: act.title,
                description: act.description,
                isInternal: act.isInternal,
                performedByRole: act.performedByRole,
                createdAt: act.createdAt,
              }))}
              orderId={String(order._id)}
            />
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:sticky lg:top-20">
            <OrderCustomerCard
              name={order.customer.name}
              phone={order.customer.phone}
              email={order.customer.email}
              customerType={order.customerType}
            />

            <OrderDeliveryCard
              division={order.customer.division}
              district={order.customer.district}
              upazila={order.customer.upazila}
              address={order.customer.address}
              courier={order.delivery?.courier}
              trackingNumber={order.delivery?.trackingNumber}
            />

            <OrderPaymentCard
              orderId={String(order._id)}
              payment={{
                method: order.payment.method,
                status: order.payment.status,
                amount: order.payment.amount,
                paidAmount: order.payment.paidAmount,
                dueAmount: order.payment.dueAmount,
                instructions: order.payment.instructions,
                gateway: order.payment.gateway,
                transactionId: order.payment.transactionId,
                rejectionReason: order.payment.rejectionReason,
              }}
              serializedPayment={{
                verifiedAt: serialized.payment.verifiedAt,
              }}
            />

            {order.note && (
              <section className="card p-5">
                <h2 className="font-display font-bold text-lg mb-2">Customer Note</h2>
                <p className="text-sm text-[var(--mute)] leading-relaxed">{order.note}</p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
