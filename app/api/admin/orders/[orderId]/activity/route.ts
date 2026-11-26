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

  if (!mongoose.isValidObjectId(params.orderId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: { note?: string; isInternal?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const note = body.note?.trim();
  if (!note) return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });

  try {
    await dbConnect();

    const activity = {
      _id: new mongoose.Types.ObjectId(),
      type: "admin_note",
      title: "Admin Note",
      description: note,
      performedBy: new mongoose.Types.ObjectId(actor.id),
      performedByRole: "admin",
      isInternal: body.isInternal ?? true,
      createdAt: new Date(),
    };

    const order = await Order.findByIdAndUpdate(
      params.orderId,
      { $push: { activities: activity } },
      { new: true },
    ).lean();

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
