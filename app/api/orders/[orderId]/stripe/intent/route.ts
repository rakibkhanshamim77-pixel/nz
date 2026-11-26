import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { SESSION_COOKIE, verifySession } from "@/app/utils/session";
import { verifyGuestToken } from "@/lib/guestToken";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { stripe } from "@/lib/stripe";

async function authorizeOrderAccess(orderId: string, guestToken: string | null) {
  const sessionToken = cookies().get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const session = verifySession(sessionToken);
    if (session) return true;
  }
  if (guestToken && verifyGuestToken(orderId, guestToken)) return true;
  return false;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  if (!mongoose.isValidObjectId(params.orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const guestToken = req.headers.get("x-guest-token");
  const authorized = await authorizeOrderAccess(params.orderId, guestToken);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const order = await Order.findById(params.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If a PaymentIntent already exists for this order, return it
    if (order.payment.transactionId?.startsWith("pi_")) {
      const existing = await stripe.paymentIntents.retrieve(order.payment.transactionId);
      if (existing.status !== "canceled") {
        return NextResponse.json({ clientSecret: existing.client_secret });
      }
    }

    // Amount in smallest currency unit (cents/paise/etc.)
    // paymentAmount is what the customer owes now
    const amountInCents = Math.round(order.payment.amount * 100);

    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd", // change to your currency if needed
      metadata: {
        orderId: params.orderId,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
      },
      description: `Order ${order.orderNumber}`,
    });

    // Store the PaymentIntent ID on the order so we can retrieve it later
    await Order.findByIdAndUpdate(params.orderId, {
      $set: {
        "payment.transactionId": intent.id,
        "payment.gateway": "stripe",
      },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("[stripe/intent]", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
