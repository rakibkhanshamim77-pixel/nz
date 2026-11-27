import { notFound } from "next/navigation";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { getStoreSettings } from "@/db/settings.server";
import InvoicePrintPage from "./_components/InvoicePrintPage";

export const dynamic = "force-dynamic";

interface Props {
  params: { orderNumber: string };
}

export default async function InvoicePage({ params }: Props) {
  const orderNumber = params.orderNumber.trim().toUpperCase();

  let order: Record<string, unknown> | null = null;
  try {
    await dbConnect();
    order = await Order.findOne({ orderNumber })
      .select("orderNumber status customer items subtotal deliveryCharge discount totalAmount payment delivery createdAt note")
      .lean<Record<string, unknown>>();
  } catch {
    // fall through to notFound
  }

  if (!order) notFound();

  const { store } = await getStoreSettings();

  const c        = order.customer as Record<string, string>;
  const payment  = (order.payment  as Record<string, unknown>) ?? {};
  const delivery = (order.delivery as Record<string, unknown>) ?? {};
  const items    = (order.items    as Record<string, unknown>[]) ?? [];

  const data = {
    orderNumber:    order.orderNumber as string,
    status:         order.status as string,
    createdAt:      (order.createdAt as Date).toISOString(),
    customer: {
      name:     c.name ?? "",
      phone:    c.phone ?? "",
      email:    c.email ?? "",
      address:  c.address ?? "",
      upazila:  c.upazila ?? "",
      district: c.district ?? "",
      division: c.division ?? "",
    },
    items: items.map((i) => ({
      name:       i.name as string,
      size:       (i.size as string) ?? "",
      color:      (i.color as string) ?? "",
      quantity:   i.quantity as number,
      unitPrice:  i.unitPrice as number,
      totalPrice: i.totalPrice as number,
    })),
    subtotal:       order.subtotal as number,
    deliveryCharge: order.deliveryCharge as number,
    discount:       order.discount as number,
    totalAmount:    order.totalAmount as number,
    payment: {
      method:        (payment.method as string) ?? "",
      gateway:       (payment.gateway as string) ?? "",
      transactionId: (payment.transactionId as string) ?? "",
    },
    delivery: {
      area:           [c.district, c.division].filter(Boolean).join(", "),
      courier:        (delivery.courier as string) ?? "",
      trackingNumber: (delivery.trackingNumber as string) ?? "",
    },
    store: {
      name:         store.name    || "Neeshanz",
      email:        store.supportEmail || "support@neeshanz.com",
      phone:        store.supportPhone || "",
      address:      store.address || "Dhaka, Bangladesh",
      website:      "www.neeshanz.com",
    },
  };

  return <InvoicePrintPage data={data} />;
}
