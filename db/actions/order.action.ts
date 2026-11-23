"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import Product from "@/db/models/Product";
import { publishedProductFilter } from "@/db/utils/productVisibility";
import { getUser } from "@/app/utils/getUser";
import { deriveGuestToken } from "@/lib/guestToken";
import { sendOrderConfirmation } from "@/app/lib/sms";
import { deliveryChargeFor } from "@/db/settings";
import { getStoreSettings } from "@/db/settings.server";
import { validateCoupon } from "@/db/actions/validateCoupon";
import Coupon from "@/db/models/Coupon";
import {
  getDivisionById,
  getDistrictById,
  getUpazilaById,
} from "@/data/bd-locations";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PlaceOrderInput {
  customer: {
    name: string;
    phone: string;
    email?: string;
    divisionId: number;
    districtId: number;
    upazilaId?: number;
    address: string;
  };
  note?: string;
  paymentMethod: "cod" | "online";
  items: {
    productId: string;
    size?: string;
    color?: string;
    colorHex?: string;
    quantity: number;
  }[];
  mode: "cart" | "buynow";
  couponCode?: string;
}

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NEE-${y}${m}${d}-${rand}`;
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<ActionResult<{ orderNumber: string; orderId: string; guestToken?: string }>> {
  // Validate input shape
  if (!input.customer?.name?.trim())
    return { success: false, error: "নাম প্রয়োজন" };
  if (!input.customer?.phone?.trim())
    return { success: false, error: "মোবাইল নম্বর প্রয়োজন" };
  if (!input.customer?.divisionId)
    return { success: false, error: "বিভাগ নির্বাচন করুন" };
  if (!input.customer?.districtId)
    return { success: false, error: "জেলা নির্বাচন করুন" };
  if (!input.customer?.address?.trim())
    return { success: false, error: "ঠিকানা প্রয়োজন" };
  if (!input.items?.length)
    return { success: false, error: "কার্টে কোনো পণ্য নেই" };
  if (!["cod", "online"].includes(input.paymentMethod))
    return { success: false, error: "পেমেন্ট পদ্ধতি নির্বাচন করুন" };

  // Server-side location validation
  const divisionData = getDivisionById(input.customer.divisionId);
  if (!divisionData) return { success: false, error: "অবৈধ বিভাগ" };

  const districtData = getDistrictById(input.customer.districtId);
  if (!districtData) return { success: false, error: "অবৈধ জেলা" };
  if (districtData.division_id !== input.customer.divisionId)
    return { success: false, error: "জেলাটি নির্বাচিত বিভাগের অন্তর্গত নয়" };

  let upazilaData = undefined;
  if (input.customer.upazilaId) {
    upazilaData = getUpazilaById(input.customer.upazilaId);
    if (!upazilaData) return { success: false, error: "অবৈধ উপজেলা" };
    if (upazilaData.district_id !== input.customer.districtId)
      return { success: false, error: "উপজেলাটি নির্বাচিত জেলার অন্তর্গত নয়" };
  }

  const phoneRegex = /^01[3-9]\d{8}$/;
  if (!phoneRegex.test(input.customer.phone.replace(/\s/g, "")))
    return { success: false, error: "বৈধ বাংলাদেশি মোবাইল নম্বর দিন" };

  if (input.items.some((i) => !mongoose.isValidObjectId(i.productId)))
    return { success: false, error: "অবৈধ পণ্য তথ্য" };

  if (input.items.some((i) => !i.quantity || i.quantity < 1 || i.quantity > 20))
    return { success: false, error: "পরিমাণ ১–২০ হতে হবে" };

  try {
    await dbConnect();

    // Re-fetch product prices from DB — never trust client prices
    const productIds = input.items.map((i) => new mongoose.Types.ObjectId(i.productId));
    const products = await Product.find({ _id: { $in: productIds }, ...publishedProductFilter() }).lean();

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    for (const inputItem of input.items) {
      const product = productMap.get(inputItem.productId);
      if (!product) return { success: false, error: `পণ্যটি পাওয়া যায়নি` };
      if (product.stock < inputItem.quantity)
        return { success: false, error: `${product.name} স্টকে নেই` };

      orderItems.push({
        product: new mongoose.Types.ObjectId(inputItem.productId),
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] ?? "",
        sku: product.sku,
        size: inputItem.size,
        color: inputItem.color,
        colorHex: inputItem.colorHex,
        quantity: inputItem.quantity,
        unitPrice: product.salePrice,
        totalPrice: product.salePrice * inputItem.quantity,
      });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.totalPrice, 0);
    const { delivery } = await getStoreSettings();
    const deliveryCharge = deliveryChargeFor(input.customer.districtId, subtotal, delivery);

    // Validate coupon server-side
    let discount = 0;
    let appliedCouponCode: string | undefined;
    if (input.couponCode?.trim()) {
      const couponResult = await validateCoupon(input.couponCode.trim(), subtotal);
      if (!couponResult.ok) return { success: false, error: couponResult.error };
      discount = couponResult.discountAmount;
      appliedCouponCode = couponResult.code;
    }

    const totalAmount = Math.max(0, subtotal + deliveryCharge - discount);

    const paymentAmount =
      input.paymentMethod === "cod" ? deliveryCharge : totalAmount;
    const dueAmount =
      input.paymentMethod === "cod" ? subtotal - discount : 0;

    // Get authenticated user if any
    const authUser = await getUser();
    const customerType = authUser ? "registered" : "guest";

    // Generate unique order number (retry up to 3 times on collision)
    let orderNumber = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = generateOrderNumber();
      const exists = await Order.exists({ orderNumber: candidate });
      if (!exists) { orderNumber = candidate; break; }
    }
    if (!orderNumber) return { success: false, error: "অর্ডার নম্বর তৈরি করতে ব্যর্থ" };

    const order = await Order.create({
      orderNumber,
      user: authUser ? new mongoose.Types.ObjectId(authUser.id) : undefined,
      customerType,
      customer: {
        name: input.customer.name.trim(),
        phone: input.customer.phone.trim(),
        email: input.customer.email?.trim() || undefined,
        division: divisionData.name_bn,
        district: districtData.name_bn,
        upazila: upazilaData?.name_bn || undefined,
        address: input.customer.address.trim(),
      },
      note: input.note?.trim() || undefined,
      items: orderItems,
      subtotal,
      deliveryCharge,
      discount,
      couponCode: appliedCouponCode,
      totalAmount,
      paymentAmount,
      dueAmount,
      currency: "BDT",
      payment: {
        method: input.paymentMethod,
        status: "pending",
        amount: paymentAmount,
        paidAmount: 0,
        dueAmount: paymentAmount,
        instructions:
          input.paymentMethod === "cod"
            ? "পণ্য ডেলিভারির সময় বাকি টাকা পরিশোধ করুন"
            : undefined,
      },
      status: "pending",
      delivery: {},
      activities: [
        {
          type: "order_created",
          title: "অর্ডার প্রদান করা হয়েছে",
          description: `${customerType === "guest" ? "অতিথি" : "নিবন্ধিত"} গ্রাহক কর্তৃক অর্ডার দেওয়া হয়েছে`,
          performedByRole: "customer",
          isInternal: false,
        },
      ],
    });

    // Decrement stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Increment coupon usedCount
    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: appliedCouponCode },
        { $inc: { usedCount: 1 } },
      );
    }

    const orderId = String(order._id);
    const guestToken = deriveGuestToken(orderId);

    // Fire-and-forget — SMS failure must not fail the order
    sendOrderConfirmation(
      input.customer.phone.trim(),
      input.customer.name.trim(),
      order.orderNumber,
      totalAmount,
      input.paymentMethod,
    ).catch((err) => console.error("[placeOrder] SMS send failed:", err));

    // Fire-and-forget admin notifications
    try {
      const { createNotificationsForAdmins } = await import("./admin/notification.action");
      const { sendPushToAdmins } = await import("@/lib/webpush");
      const eventId = `order:${order._id}`;
      createNotificationsForAdmins(
        "new_order",
        "নতুন অর্ডার",
        `${order.orderNumber} — ${input.customer.name.trim()} — ৳${totalAmount}`,
        `/admin/orders/${orderId}`,
        orderId,
        eventId,
      ).catch(() => {});
      sendPushToAdmins({
        title: "নতুন অর্ডার!",
        body: `${order.orderNumber} — ৳${totalAmount}`,
        url: `/admin/orders/${orderId}`,
      }).catch(() => {});
    } catch {}

    return {
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderId,
        guestToken,
      },
    };
  } catch (err) {
    console.error("[placeOrder] failed:", err);
    return { success: false, error: "অর্ডার প্রদানে সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
  }
}

export async function getMyOrders(): Promise<ActionResult<unknown[]>> {
  const user = await getUser();
  if (!user) return { success: false, error: "লগইন করুন" };

  try {
    await dbConnect();
    const orders = await Order.find({ user: new mongoose.Types.ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .select("-activities -__v")
      .lean();

    return {
      success: true,
      data: orders.map((o) => ({
        id: String(o._id),
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        paymentMethod: o.payment.method,
        paymentStatus: o.payment.status,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    };
  } catch {
    return { success: false, error: "তথ্য লোড করতে ব্যর্থ" };
  }
}
