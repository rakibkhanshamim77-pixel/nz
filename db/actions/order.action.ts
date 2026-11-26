"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import Product from "@/db/models/Product";
import { publishedProductFilter } from "@/db/utils/productVisibility";
import { getUser } from "@/app/utils/getUser";
import { deriveGuestToken } from "@/lib/guestToken";
import { sendOrderConfirmation } from "@/app/lib/sms";
import { sendOrderConfirmationEmail } from "@/app/lib/email";
import { deliveryChargeFor } from "@/db/settings";
import { getStoreSettings } from "@/db/settings.server";
import { validateCoupon } from "@/db/actions/validateCoupon";
import Coupon from "@/db/models/Coupon";
import { getCountryByCode } from "@/data/countries";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PlaceOrderInput {
  customer: {
    name: string;
    phone?: string;
    email: string;
    countryCode: string;
    state?: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode?: string;
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
  // Basic input validation
  if (!input.customer?.name?.trim())
    return { success: false, error: "Full name is required." };
  if (!input.customer?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.customer.email.trim()))
    return { success: false, error: "A valid email address is required." };
  if (!input.customer?.countryCode)
    return { success: false, error: "Country is required." };
  if (!input.customer?.city?.trim())
    return { success: false, error: "City is required." };
  if (!input.customer?.addressLine1?.trim())
    return { success: false, error: "Street address is required." };
  if (!input.items?.length)
    return { success: false, error: "No items in cart." };
  if (!["cod", "online"].includes(input.paymentMethod))
    return { success: false, error: "Select a payment method." };

  // Validate country
  const countryData = getCountryByCode(input.customer.countryCode);
  if (!countryData) return { success: false, error: "Invalid country." };

  if (countryData.statesRequired && !input.customer.state?.trim())
    return { success: false, error: `${countryData.stateLabel} is required for ${countryData.name}.` };

  // Phone must be non-empty with at least 6 digits
  if (input.customer.phone?.trim()) {
    const phoneDigits = input.customer.phone.replace(/\D/g, "");
    if (phoneDigits.length < 6)
      return { success: false, error: "Enter a valid phone number." };
  }

  if (input.items.some((i) => !mongoose.isValidObjectId(i.productId)))
    return { success: false, error: "Invalid product data." };
  if (input.items.some((i) => !i.quantity || i.quantity < 1 || i.quantity > 20))
    return { success: false, error: "Quantity must be between 1 and 20." };

  try {
    await dbConnect();

    const productIds = input.items.map((i) => new mongoose.Types.ObjectId(i.productId));
    const products = await Product.find({ _id: { $in: productIds }, ...publishedProductFilter() }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    for (const inputItem of input.items) {
      const product = productMap.get(inputItem.productId);
      if (!product) return { success: false, error: "Product not found." };
      if (product.stock < inputItem.quantity)
        return { success: false, error: `${product.name} is out of stock.` };

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
    const { delivery, store } = await getStoreSettings();

    const deliveryCharge = deliveryChargeFor(
      input.customer.countryCode,
      store.country,
      subtotal,
      delivery,
    );

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
    // COD: nothing paid in advance — full amount due on delivery
    const paymentAmount = input.paymentMethod === "cod" ? 0 : totalAmount;
    const dueAmount = input.paymentMethod === "cod" ? totalAmount : 0;

    const authUser = await getUser();
    const customerType = authUser ? "registered" : "guest";

    let orderNumber = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = generateOrderNumber();
      const exists = await Order.exists({ orderNumber: candidate });
      if (!exists) { orderNumber = candidate; break; }
    }
    if (!orderNumber) return { success: false, error: "Failed to generate order number." };

    const order = await Order.create({
      orderNumber,
      user: authUser ? new mongoose.Types.ObjectId(authUser.id) : undefined,
      customerType,
      customer: {
        name: input.customer.name.trim(),
        phone: input.customer.phone?.trim() || undefined,
        email: input.customer.email.trim(),
        country: countryData.name,
        countryCode: input.customer.countryCode,
        state: input.customer.state?.trim() || undefined,
        city: input.customer.city.trim(),
        addressLine1: input.customer.addressLine1.trim(),
        addressLine2: input.customer.addressLine2?.trim() || undefined,
        postalCode: input.customer.postalCode?.trim() || undefined,
        // Fill legacy fields for BD orders so existing admin panels still display correctly
        division: input.customer.countryCode === "BD" ? input.customer.state?.trim() : undefined,
        district: input.customer.countryCode === "BD" ? input.customer.city.trim() : undefined,
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
            ? "Pay the remaining amount on delivery."
            : undefined,
      },
      status: "pending",
      delivery: {},
      activities: [
        {
          type: "order_created",
          title: "Order placed",
          description: `${customerType === "guest" ? "Guest" : "Registered"} customer placed the order`,
          performedByRole: "customer",
          isInternal: false,
        },
      ],
    });

    // Decrement stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Increment coupon usage
    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate({ code: appliedCouponCode }, { $inc: { usedCount: 1 } });
    }

    const orderId = String(order._id);
    const guestToken = deriveGuestToken(orderId);

    // Fire-and-forget order confirmation email
    sendOrderConfirmationEmail(
      input.customer.email.trim(),
      input.customer.name.trim(),
      order.orderNumber,
      totalAmount,
      input.paymentMethod,
    ).catch((err) => console.error("[placeOrder] confirmation email failed:", err));

    // Fire-and-forget SMS (only when phone provided)
    if (input.customer.phone?.trim()) {
      sendOrderConfirmation(
        input.customer.phone.trim(),
        input.customer.name.trim(),
        order.orderNumber,
        totalAmount,
        input.paymentMethod,
      ).catch((err) => console.error("[placeOrder] SMS send failed:", err));
    }

    // Admin notifications
    try {
      const { createNotificationsForAdmins } = await import("./admin/notification.action");
      const { sendPushToAdmins } = await import("@/lib/webpush");
      const eventId = `order:${order._id}`;
      createNotificationsForAdmins(
        "new_order",
        "New Order",
        `${order.orderNumber} — ${input.customer.name.trim()} — ৳${totalAmount}`,
        `/admin/orders/${orderId}`,
        orderId,
        eventId,
      ).catch(() => {});
      sendPushToAdmins({
        title: "New Order!",
        body: `${order.orderNumber} — ৳${totalAmount}`,
        url: `/admin/orders/${orderId}`,
      }).catch(() => {});
    } catch {}

    return { success: true, data: { orderNumber: order.orderNumber, orderId, guestToken } };
  } catch (err) {
    console.error("[placeOrder] failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getMyOrders(): Promise<ActionResult<unknown[]>> {
  const user = await getUser();
  if (!user) return { success: false, error: "Please log in." };

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
    return { success: false, error: "Failed to load orders." };
  }
}
