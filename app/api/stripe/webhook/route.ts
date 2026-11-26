import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";

// Stripe requires the raw body for signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If no webhook secret is configured, we still process for dev convenience
  // but log a warning
  if (!webhookSecret) {
    console.warn("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent> | null = null;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("[stripe/webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Dev mode: parse without verification
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
  }

  if (!event) return NextResponse.json({ received: true });

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as { id: string; metadata?: { orderId?: string } };
        await handlePaymentSucceeded(intent.id, intent.metadata?.orderId);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as { id: string; last_payment_error?: { message?: string }; metadata?: { orderId?: string } };
        await handlePaymentFailed(intent.id, intent.metadata?.orderId, intent.last_payment_error?.message);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(intentId: string, orderId?: string) {
  await dbConnect();

  const order = orderId && mongoose.isValidObjectId(orderId)
    ? await Order.findById(orderId)
    : await Order.findOne({ "payment.transactionId": intentId });

  if (!order) {
    console.warn("[stripe/webhook] Order not found for intent", intentId);
    return;
  }

  if (order.payment.status === "paid") return; // already processed

  await Order.findByIdAndUpdate(order._id, {
    $set: {
      "payment.status": "paid",
      "payment.paidAmount": order.payment.amount,
      "payment.dueAmount": 0,
      "payment.paidAt": new Date(),
      "payment.gateway": "stripe",
      "payment.transactionId": intentId,
    },
    $push: {
      activities: {
        _id: new mongoose.Types.ObjectId(),
        type: "payment_confirmed",
        title: "Payment Confirmed",
        description: `Stripe payment confirmed. Intent: ${intentId}`,
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
      `payment:${intentId}`,
    ).catch(() => {});
    sendPushToAdmins({
      title: "Payment Received",
      body: `${order.orderNumber} paid via Stripe`,
      url: `/admin/orders/${ordIdStr}`,
    }).catch(() => {});
  } catch {}
}

async function handlePaymentFailed(intentId: string, orderId?: string, reason?: string) {
  await dbConnect();

  const order = orderId && mongoose.isValidObjectId(orderId)
    ? await Order.findById(orderId)
    : await Order.findOne({ "payment.transactionId": intentId });

  if (!order) return;

  await Order.findByIdAndUpdate(order._id, {
    $set: {
      "payment.status": "failed",
      "payment.rejectionReason": reason ?? "Payment failed",
    },
    $push: {
      activities: {
        _id: new mongoose.Types.ObjectId(),
        type: "payment_failed",
        title: "Payment Failed",
        description: `Stripe payment failed. ${reason ?? ""}`,
        performedByRole: "system",
        isInternal: true,
        createdAt: new Date(),
      },
    },
  });
}
