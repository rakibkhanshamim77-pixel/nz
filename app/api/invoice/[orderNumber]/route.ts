import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderNumber: string } },
) {
  const orderNumber = params.orderNumber.trim().toUpperCase();
  if (!orderNumber) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    await dbConnect();
    const order = await Order.findOne({ orderNumber })
      .select("orderNumber status customer items subtotal deliveryCharge discount totalAmount payment delivery createdAt note")
      .lean<Record<string, unknown>>();

    if (!order) return NextResponse.json({ error: "notfound" }, { status: 404 });

    const c        = order.customer as Record<string, string>;
    const payment  = (order.payment  as Record<string, unknown>) ?? {};
    const delivery = (order.delivery as Record<string, unknown>) ?? {};
    const items    = (order.items    as Record<string, unknown>[]) ?? [];

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status:      order.status,
      createdAt:   order.createdAt,
      note:        order.note ?? "",
      customer: {
        name:     c.name,
        phone:    c.phone,
        email:    c.email ?? "",
        address:  c.address,
        upazila:  c.upazila ?? "",
        district: c.district,
        division: c.division ?? "",
      },
      items: items.map((i) => ({
        name:       i.name,
        size:       i.size ?? "",
        color:      i.color ?? "",
        quantity:   i.quantity,
        unitPrice:  i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      subtotal:       order.subtotal,
      deliveryCharge: order.deliveryCharge,
      discount:       order.discount,
      totalAmount:    order.totalAmount,
      payment: {
        method:        payment.method,
        gateway:       payment.gateway ?? "",
        transactionId: payment.transactionId ?? "",
      },
      delivery: {
        area: [c.district, c.division].filter(Boolean).join(", "),
        courier:        delivery.courier ?? "",
        trackingNumber: delivery.trackingNumber ?? "",
      },
    });
  } catch (err) {
    console.error("[GET /api/invoice]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
