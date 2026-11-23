import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requirePermission } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const actor = await requirePermission("order_management");
  if (!actor) return forbidden();

  if (!mongoose.isValidObjectId(params.orderId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reason = body.reason?.trim();
  if (!reason) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const order = await Order.findById(params.orderId);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (order.payment.status !== "processing") {
      return NextResponse.json(
        { error: "Only processing payments can be rejected" },
        { status: 400 },
      );
    }

    const adminLabel = actor.name ?? actor.phone;

    const now = new Date();
    await Order.findByIdAndUpdate(params.orderId, {
      $set: {
        "payment.status": "failed",
        "payment.rejectionReason": reason,
      },
      $push: {
        activities: {
          _id: new mongoose.Types.ObjectId(),
          type: "payment_rejected",
          title: "পেমেন্ট প্রত্যাখ্যান করা হয়েছে",
          description: `${adminLabel} পেমেন্ট প্রত্যাখ্যান করেছেন। কারণ: ${reason}`,
          performedBy: new mongoose.Types.ObjectId(actor.id),
          performedByRole: "admin",
          isInternal: false,
          createdAt: now,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
