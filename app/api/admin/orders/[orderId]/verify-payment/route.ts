import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requirePermission } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  const actor = await requirePermission("order_management");
  if (!actor) return forbidden();

  if (!mongoose.isValidObjectId(params.orderId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await dbConnect();

    const order = await Order.findById(params.orderId);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (order.payment.status !== "processing") {
      return NextResponse.json(
        { error: "Only processing payments can be verified" },
        { status: 400 },
      );
    }

    const adminLabel = actor.name ?? actor.phone;

    const now = new Date();
    await Order.findByIdAndUpdate(params.orderId, {
      $set: {
        "payment.status": "paid",
        "payment.paidAmount": order.payment.amount,
        "payment.dueAmount": 0,
        "payment.paidAt": now,
        "payment.verifiedAt": now,
        "payment.verifiedBy": new mongoose.Types.ObjectId(actor.id),
      },
      $push: {
        activities: {
          _id: new mongoose.Types.ObjectId(),
          type: "payment_verified",
          title: "Payment Verified",
          description: `${adminLabel} verified the payment`,
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
