"use server";

import dbConnect from "../connect/dbConnect";
import Review from "../models/Review";
import Order from "../models/Order";
import Product from "../models/Product";

export interface ReviewItem {
  id: string;
  customerName: string;
  avatarColor: string;
  badge: string;
  rating: number;
  comment: string;
  storeReply: string | null;
  isVerifiedPurchase: boolean;
  /** ISO date string */
  createdAt: string;
}

export interface GetReviewsOptions {
  /** Max reviews to return (default 3, capped at 24) */
  limit?: number;
  /** Only reviews pinned for the home page (default true) */
  featuredOnly?: boolean;
}

async function getReviews({
  limit = 3,
  featuredOnly = true,
}: GetReviewsOptions = {}): Promise<ReviewItem[]> {
  try {
    await dbConnect();

    // Unpublished reviews are only visible while developing locally — never in production.
    // (Decided on the server, not by an argument, because server actions can be called from the browser.)
    const filter: Record<string, unknown> =
      process.env.NODE_ENV === "production" ? { isPublished: true } : {};
    if (featuredOnly) filter.isFeatured = true;

    const reviews = await Review.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(Math.min(Math.max(1, limit), 24))
      .lean();

    // Plain, serializable objects (no ObjectId / Date)
    return reviews.map((r) => ({
      id: String(r._id),
      customerName: r.customerName,
      avatarColor: r.avatarColor ?? "#3b82f6",
      badge: r.badge ?? "ক্রেতা",
      rating: Math.min(5, Math.max(1, Math.round(r.rating))),
      comment: r.comment,
      storeReply: r.storeReply?.text ?? null,
      isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "",
    }));
  } catch (error) {
    console.error("[getReviews] failed:", error);
    return [];
  }
}

export { getReviews };

/* ------------------------------------------------------------------ */
/*  Purchase verification before allowing a review                      */
/* ------------------------------------------------------------------ */

export type PurchaseVerifyResult =
  | { ok: false; reason: "invalid_phone" }
  | { ok: false; reason: "not_purchased" }
  | { ok: false; reason: "not_delivered"; orderStatus: string; orderNumber: string }
  | { ok: false; reason: "cancelled"; orderNumber: string }
  | { ok: true; orderNumber: string; customerName: string; orderedSize?: string; orderedColor?: string };

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("88") ? digits.slice(2) : digits;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

const STATUS_BN: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  returned:   "Returned",
  refunded:   "Refunded",
};

export async function verifyPurchase(
  rawPhone: string,
  productSlug: string,
): Promise<PurchaseVerifyResult> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, reason: "invalid_phone" };

  try {
    await dbConnect();

    // Match phone stored in any common BD format: 01X... / 801X... / +8801X...
    const phoneRegex = new RegExp(`(^|\\D)${phone}($|\\D)`);

    const order = await Order.findOne({
      "customer.phone": { $regex: phoneRegex },
      "items.slug": productSlug,
    })
      .sort({ createdAt: -1 })
      .select("status orderNumber customer.name items")
      .lean();

    if (!order) return { ok: false, reason: "not_purchased" };

    const { status, orderNumber, customer, items } = order;
    const matchedItem = items.find((i) => i.slug === productSlug);

    if (status === "cancelled" || status === "returned" || status === "refunded") {
      return { ok: false, reason: "cancelled", orderNumber };
    }

    if (status !== "delivered") {
      return {
        ok: false,
        reason: "not_delivered",
        orderStatus: STATUS_BN[status] ?? status,
        orderNumber,
      };
    }

    return {
      ok: true,
      orderNumber,
      customerName: customer.name,
      orderedSize:  matchedItem?.size,
      orderedColor: matchedItem?.color,
    };
  } catch (err) {
    console.error("[verifyPurchase] failed:", err);
    return { ok: false, reason: "not_purchased" };
  }
}

/* ------------------------------------------------------------------ */
/*  Submit a verified review                                             */
/* ------------------------------------------------------------------ */

export interface SubmitReviewInput {
  productSlug: string;
  orderNumber: string;
  phone: string;
  rating: number;
  customerName: string;
  size?: string;
  color?: string;
  fit?: string;
  title: string;
  comment: string;
}

const AVATAR_COLORS = [
  "#9b2c4a", "#2f6f5e", "#1e3a8a", "#6d28d9",
  "#b45309", "#0369a1", "#15803d", "#be185d",
];

function pickAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export async function submitReview(
  input: SubmitReviewInput,
): Promise<{ success: boolean; error?: string }> {
  // Server-side validation
  if (!input.rating || input.rating < 1 || input.rating > 5)
    return { success: false, error: "রেটিং দিন (১–৫)" };
  if (!input.customerName?.trim() || input.customerName.trim().length < 2)
    return { success: false, error: "আপনার নাম লিখুন" };
  if (!input.title?.trim())
    return { success: false, error: "শিরোনাম লিখুন" };
  if (!input.comment?.trim() || input.comment.trim().length < 10)
    return { success: false, error: "বিস্তারিত রিভিউ লিখুন (কমপক্ষে ১০ অক্ষর)" };

  const phone = normalizePhone(input.phone);
  if (!phone) return { success: false, error: "মোবাইল নম্বর অবৈধ" };

  try {
    await dbConnect();

    // Re-verify the purchase server-side before saving
    const verify = await verifyPurchase(input.phone, input.productSlug);
    if (!verify.ok || verify.orderNumber !== input.orderNumber) {
      return { success: false, error: "ক্রয় যাচাই ব্যর্থ হয়েছে" };
    }

    // Find the product ObjectId by slug
    const product = await Product.findOne({ slug: input.productSlug })
      .select("_id")
      .lean();

    // Build comment: prepend title then body, then optional meta
    const metaParts: string[] = [];
    if (input.size)  metaParts.push(`সাইজ: ${input.size}`);
    if (input.color) metaParts.push(`রং: ${input.color}`);
    if (input.fit)   metaParts.push(`ফিট: ${input.fit === "small" ? "একটু ছোট" : input.fit === "large" ? "একটু বড়" : "ঠিকঠাক"}`);
    const fullComment = [
      `【${input.title.trim()}】`,
      input.comment.trim(),
      metaParts.length ? metaParts.join(" | ") : "",
    ].filter(Boolean).join("\n");

    await Review.create({
      product:            product?._id ?? undefined,
      customerName:       input.customerName.trim(),
      avatarColor:        pickAvatarColor(input.customerName),
      badge:              "যাচাইকৃত ক্রেতা",
      isVerifiedPurchase: true,
      rating:             input.rating,
      comment:            fullComment.slice(0, 1000),
      isPublished:        false, // admin approves before showing
      isFeatured:         false,
    });

    return { success: true };
  } catch (err) {
    console.error("[submitReview] failed:", err);
    return { success: false, error: "রিভিউ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
  }
}
