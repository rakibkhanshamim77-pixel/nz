import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requirePermission } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { sendOrderStatusUpdate } from "@/app/lib/sms";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const actor = await requirePermission("order_management");
  if (!actor) return forbidden();

  if (!mongoose.isValidObjectId(params.orderId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await dbConnect();
    const order = await Order.findById(params.orderId).lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const ORDER_STATUSES = [
  "pending","confirmed","processing","shipped","delivered",
  "cancelled","returned","refunded",
];

const PAYMENT_STATUSES = [
  "pending","processing","paid","partially_paid","failed","refunded","partially_refunded",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const actor = await requirePermission("order_management");
  if (!actor) return forbidden();

  if (!mongoose.isValidObjectId(params.orderId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const $set: Record<string, any> = {};
  const activity: Record<string, unknown> = {
    performedBy: new mongoose.Types.ObjectId(actor.id),
    performedByRole: "admin",
    isInternal: false,
    createdAt: new Date(),
  };

  if (body.status) {
    if (!ORDER_STATUSES.includes(body.status as string))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    $set.status = body.status;
    activity.type = "status_updated";
    activity.title = `অর্ডার স্ট্যাটাস আপডেট: ${body.status}`;
    activity.status = body.status as string;
  }

  if (body.paymentStatus) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus as string))
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    $set["payment.status"] = body.paymentStatus;
    activity.type = activity.type ?? "payment_updated";
    activity.title = activity.title ?? `পেমেন্ট স্ট্যাটাস আপডেট: ${body.paymentStatus}`;
  }

  if (body.trackingNumber) $set["delivery.trackingNumber"] = body.trackingNumber;
  if (body.trackingUrl) $set["delivery.trackingUrl"] = body.trackingUrl;
  if (body.courier) $set["delivery.courier"] = body.courier;

  if (!Object.keys($set).length)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  try {
    await dbConnect();

    const order = await Order.findByIdAndUpdate(
      params.orderId,
      {
        $set,
        $push: {
          activities: { ...activity, _id: new mongoose.Types.ObjectId() },
        },
      },
      { new: true },
    ).lean();

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fire-and-forget SMS on status change
    if (body.status) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = order as any;
      if (o.customer?.phone) {
        sendOrderStatusUpdate(
          o.customer.phone,
          o.customer.name ?? "গ্রাহক",
          o.orderNumber ?? params.orderId,
          body.status as string,
        ).catch((err) => console.error("[orderStatus] SMS failed:", err));
      }
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
