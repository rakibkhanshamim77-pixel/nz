import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { SESSION_COOKIE, verifySession } from "@/app/utils/session";
import { verifyGuestToken } from "@/lib/guestToken";
import PaymentClient from "./_component/PaymentClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment – Neeshanz",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: { orderId?: string; token?: string };
}

export default async function PaymentPage({ searchParams }: Props) {
  const { orderId, token } = searchParams;

  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    notFound();
  }

  // Verify ownership: session user OR valid guest token
  let authorized = false;
  const sessionToken = cookies().get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const session = verifySession(sessionToken);
    if (session) authorized = true;
  }
  if (!authorized && token) {
    authorized = verifyGuestToken(orderId, token);
  }

  if (!authorized) {
    redirect("/login");
  }

  await dbConnect();
  const order = await Order.findById(orderId).lean();
  if (!order) notFound();

  return (
    <PaymentClient
      order={{
        id: String(order._id),
        orderNumber: order.orderNumber,
        items: order.items.map((i) => ({
          name: i.name,
          image: i.image,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
        })),
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        discount: order.discount,
        totalAmount: order.totalAmount,
        paymentAmount: order.payment.amount,
        paymentMethod: order.payment.method as "cod" | "online",
        customerName: order.customer.name,
        payment: {
          status: order.payment.status,
          transactionId: order.payment.transactionId,
        },
      }}
      token={token ?? ""}
    />
  );
}
