import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";

export const runtime = "nodejs";

/**
 * Called by the payment result page immediately after Stripe redirects back.
 * Retrieves the PaymentIntent server-side and syncs the order status.
 * This is a belt-and-suspenders fallback for when the webhook hasn't fired yet.
 */
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, orderId } = await req.json();

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json({ status: intent.status });
    }

    await dbConnect();

    // Find order: by orderId param, or by stored transactionId
    const filter =
      orderId && mongoose.isValidObjectId(orderId)
        ? { _id: new mongoose.Types.ObjectId(orderId) }
        : { "payment.transactionId": paymentIntentId };

    const order = await Order.findOne(filter);
    if (!order) return NextResponse.json({ status: "succeeded", synced: false });

    // Already marked paid — nothing to do
    if (order.payment.status === "paid") {
      return NextResponse.json({ status: "succeeded", synced: true });
    }

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        "payment.status": "paid",
        "payment.paidAmount": order.payment.amount,
        "payment.dueAmount": 0,
        "payment.paidAt": new Date(),
        "payment.gateway": "stripe",
        "payment.transactionId": paymentIntentId,
      },
      $push: {
        activities: {
          _id: new mongoose.Types.ObjectId(),
          type: "payment_confirmed",
          title: "Payment Confirmed",
          description: `Stripe payment confirmed. Intent: ${paymentIntentId}`,
          performedByRole: "system",
          isInternal: false,
          createdAt: new Date(),
        },
      },
    });

    // Admin notifications
    try {
      const { createNotificationsForAdmins } = await import("@/db/actions/admin/notification.action");
      const { sendPushToAdmins } = await import("@/lib/webpush");
      const ordIdStr = String(order._id);
      createNotificationsForAdmins(
        "payment_confirmed",
        "Payment Confirmed",
        `${order.orderNumber} — Stripe payment received`,
        `/admin/orders/${ordIdStr}`,
        ordIdStr,
        `payment:${paymentIntentId}`,
      ).catch(() => {});
      sendPushToAdmins({
        title: "Payment Received",
        body: `${order.orderNumber} paid via Stripe`,
        url: `/admin/orders/${ordIdStr}`,
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ status: "succeeded", synced: true });
  } catch (err) {
    console.error("[stripe/sync]", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
