import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";

const H = 3_600_000;
const t = () => Date.now();

/* ── Demo orders (phone: 01712345678) ── */
const DEMO_ORDERS = [
  {
    orderNumber: "NZ-482915",
    status: "shipped",
    createdAt: new Date(t() - 30 * H).toISOString(),
    customer: { name: "Md Shamim", phone: "01712345678", address: "House 12, Road 5, Sector 7", district: "Uttara", division: "Dhaka" },
    items: [
      { name: "Midnight Oversized Tee", slug: "midnight-oversized-tee", image: "", size: "XL", color: "Black", quantity: 2, unitPrice: 790, totalPrice: 1580 },
      { name: "Classic Essential Tee",  slug: "classic-essential-tee",  image: "", size: "L",  color: "White", quantity: 1, unitPrice: 188, totalPrice: 188 },
    ],
    subtotal: 1768, deliveryCharge: 0, discount: 0, totalAmount: 1768,
    payment:  { method: "online", transactionId: "9GH7K2L3MN", gateway: "bKash" },
    delivery: { courier: "Courier Partner", trackingNumber: "CN58201947", estimatedDeliveryAt: new Date(t() + 20 * H).toISOString() },
    activities: [
      { title: "Arrived at local hub",        createdAt: new Date(t() - 2  * H).toISOString() },
      { title: "Handed to courier",           createdAt: new Date(t() - 6  * H).toISOString() },
      { title: "Item packed",                 createdAt: new Date(t() - 18 * H).toISOString() },
      { title: "bKash payment verified",      createdAt: new Date(t() - 29 * H).toISOString() },
      { title: "Order placed",                createdAt: new Date(t() - 30 * H).toISOString() },
    ],
  },
  {
    orderNumber: "NZ-391047",
    status: "delivered",
    createdAt: new Date(t() - 15 * 24 * H).toISOString(),
    customer: { name: "Md Shamim", phone: "01712345678", address: "House 12, Road 5, Sector 7", district: "Uttara", division: "Dhaka" },
    items: [
      { name: "Classic Polo Shirt", slug: "classic-polo-shirt", image: "", size: "M", color: "Navy", quantity: 1, unitPrice: 950, totalPrice: 950 },
    ],
    subtotal: 950, deliveryCharge: 60, discount: 0, totalAmount: 1010,
    payment:  { method: "cod", transactionId: "", gateway: "COD" },
    delivery: { courier: "Sundarban Courier", trackingNumber: "SB78341029", estimatedDeliveryAt: undefined },
    activities: [
      { title: "Order delivered",   createdAt: new Date(t() - 12 * 24 * H).toISOString() },
      { title: "Handed to courier", createdAt: new Date(t() - 14 * 24 * H).toISOString() },
      { title: "Order placed",      createdAt: new Date(t() - 15 * 24 * H).toISOString() },
    ],
  },
  {
    orderNumber: "NZ-514802",
    status: "pending",
    createdAt: new Date(t() - 2 * H).toISOString(),
    customer: { name: "Md Shamim", phone: "01712345678", address: "House 12, Road 5, Sector 7", district: "Uttara", division: "Dhaka" },
    items: [
      { name: "Premium Oxford Shirt", slug: "premium-oxford-shirt", image: "", size: "L", color: "White", quantity: 1, unitPrice: 1290, totalPrice: 1290 },
    ],
    subtotal: 1290, deliveryCharge: 0, discount: 100, totalAmount: 1190,
    payment:  { method: "online", transactionId: "BK9X2TR4", gateway: "bKash" },
    delivery: { courier: undefined, trackingNumber: undefined, estimatedDeliveryAt: undefined },
    activities: [
      { title: "bKash payment verification in progress", createdAt: new Date(t() - 1 * H).toISOString() },
      { title: "Order placed",                           createdAt: new Date(t() - 2 * H).toISOString() },
    ],
  },
];

function normPhone(raw: string) {
  const n = raw.replace(/\D/g, "");
  return n.startsWith("88") ? n.slice(2) : n;
}

export async function GET(req: NextRequest) {
  const phone       = req.nextUrl.searchParams.get("phone")?.trim();
  const orderNumber = req.nextUrl.searchParams.get("orderNumber")?.trim().toUpperCase();

  if (!phone && !orderNumber) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const normalizedPhone = phone ? normPhone(phone) : null;

  /* Demo — phone lookup only (never intercept orderNumber-only queries) */
  if (normalizedPhone === "01712345678") {
    if (orderNumber) {
      const o = DEMO_ORDERS.find(d => d.orderNumber === orderNumber);
      return o ? NextResponse.json({ orders: [o] }) : NextResponse.json({ error: "notfound" }, { status: 404 });
    }
    return NextResponse.json({ orders: DEMO_ORDERS });
  }

  try {
    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (normalizedPhone) filter["customer.phone"] = { $regex: normalizedPhone, $options: "i" };
    if (orderNumber) filter.orderNumber = orderNumber;

    const docs = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .select("orderNumber status customer items subtotal deliveryCharge discount totalAmount payment delivery activities createdAt")
      .lean<Record<string, unknown>[]>()
      .exec();

    if (!docs.length) return NextResponse.json({ error: "notfound" }, { status: 404 });

    const orders = docs.map((order) => {
      const c        = order.customer as Record<string, string>;
      const delivery = (order.delivery  as Record<string, unknown>) ?? {};
      const payment  = (order.payment   as Record<string, unknown>) ?? {};
      const items    = (order.items     as Record<string, unknown>[]) ?? [];
      const acts     = (order.activities as Record<string, unknown>[]) ?? [];

      return {
        orderNumber: order.orderNumber,
        status:      order.status,
        createdAt:   order.createdAt,
        customer:    { name: c.name, phone: c.phone, address: c.address, district: c.district, division: c.division, upazila: c.upazila },
        items: items.map(i => ({ name: i.name, slug: i.slug, image: i.image, size: i.size, color: i.color, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
        subtotal: order.subtotal, deliveryCharge: order.deliveryCharge, discount: order.discount, totalAmount: order.totalAmount,
        payment:  { method: payment.method, transactionId: payment.transactionId, gateway: payment.gateway },
        delivery: { courier: delivery.courier, trackingNumber: delivery.trackingNumber, estimatedDeliveryAt: delivery.estimatedDeliveryAt },
        activities: acts.filter(a => !a.isInternal).map(a => ({ title: a.title, createdAt: a.createdAt })).reverse(),
      };
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[GET /api/track]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
