import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { SESSION_COOKIE, verifySession } from "@/app/utils/session";
import { verifyGuestToken } from "@/lib/guestToken";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { getPaymentMethod } from "@/lib/paymentConfig";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function authorizeOrderAccess(
  orderId: string,
  guestToken: string | null,
): Promise<{ authorized: boolean; userId?: string }> {
  // Try session first
  const sessionToken = cookies().get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const session = verifySession(sessionToken);
    if (session) return { authorized: true, userId: session.userId };
  }

  // Fall back to guest token
  if (guestToken && verifyGuestToken(orderId, guestToken)) {
    return { authorized: true };
  }

  return { authorized: false };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  if (!mongoose.isValidObjectId(params.orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const { authorized } = await authorizeOrderAccess(params.orderId, token);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const order = await Order.findById(params.orderId)
      .select("-activities -__v -delivery")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      order: {
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
        paymentMethod: order.payment.method,
        customer: {
          name: order.customer.name,
          district: order.customer.district,
          upazila: order.customer.upazila,
          address: order.customer.address,
        },
        payment: {
          status: order.payment.status,
          gateway: order.payment.gateway,
          transactionId: order.payment.transactionId,
          senderAccount: order.payment.senderAccount,
          screenshotDisplayUrl: order.payment.screenshotDisplayUrl,
          submittedAt: order.payment.submittedAt,
          rejectionReason: order.payment.rejectionReason,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  if (!mongoose.isValidObjectId(params.orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const guestToken = req.headers.get("x-guest-token");
  const { authorized } = await authorizeOrderAccess(params.orderId, guestToken);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const gateway = formData.get("gateway")?.toString().trim();
  const transactionId = formData.get("transactionId")?.toString().trim();
  const senderAccount = formData.get("senderAccount")?.toString().trim();
  const screenshot = formData.get("screenshot") as File | null;

  // Validate required fields
  if (!gateway) return NextResponse.json({ error: "পেমেন্ট মাধ্যম নির্বাচন করুন" }, { status: 400 });
  if (!transactionId) return NextResponse.json({ error: "ট্রানজেকশন আইডি প্রয়োজন" }, { status: 400 });
  if (transactionId.length < 6 || transactionId.length > 30) {
    return NextResponse.json({ error: "ট্রানজেকশন আইডি ৬–৩০ অক্ষরের হতে হবে" }, { status: 400 });
  }
  if (!senderAccount) return NextResponse.json({ error: "প্রেরকের নম্বর প্রয়োজন" }, { status: 400 });

  const phoneRegex = /^01[3-9]\d{8}$/;
  if (!phoneRegex.test(senderAccount.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "বৈধ বাংলাদেশি মোবাইল নম্বর দিন" }, { status: 400 });
  }

  // Validate gateway is configured
  const paymentMethod = await getPaymentMethod(gateway);
  if (!paymentMethod) {
    return NextResponse.json({ error: "অবৈধ পেমেন্ট মাধ্যম" }, { status: 400 });
  }

  // Screenshot is optional but if provided, validate it
  let screenshotUrl: string | undefined;
  let screenshotDisplayUrl: string | undefined;

  if (screenshot && screenshot.size > 0) {
    if (!ALLOWED_TYPES.includes(screenshot.type)) {
      return NextResponse.json({ error: "শুধু JPG, PNG, বা WebP ছবি আপলোড করুন" }, { status: 400 });
    }
    if (screenshot.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ছবির আকার সর্বোচ্চ ৫ MB হতে হবে" }, { status: 400 });
    }

    // Upload to ImgBB server-side
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (!imgbbKey) {
      return NextResponse.json({ error: "Screenshot upload is not configured" }, { status: 500 });
    }

    try {
      const imgbbForm = new FormData();
      imgbbForm.append("key", imgbbKey);
      imgbbForm.append("image", screenshot, screenshot.name || "screenshot.jpg");

      const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: imgbbForm,
      });

      if (!imgbbRes.ok) {
        return NextResponse.json({ error: "স্ক্রিনশট আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" }, { status: 502 });
      }

      const imgbbData = await imgbbRes.json();
      if (!imgbbData?.success || !imgbbData?.data?.url) {
        return NextResponse.json({ error: "স্ক্রিনশট আপলোড ব্যর্থ হয়েছে" }, { status: 502 });
      }

      screenshotUrl = imgbbData.data.image?.url ?? imgbbData.data.url;
      screenshotDisplayUrl = imgbbData.data.display_url ?? imgbbData.data.url;
    } catch {
      return NextResponse.json({ error: "স্ক্রিনশট আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" }, { status: 502 });
    }
  }

  try {
    await dbConnect();

    const order = await Order.findById(params.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prevent duplicate/corrupt submissions — only allow if status is pending or failed (rejected)
    if (order.payment.status === "processing" || order.payment.status === "paid") {
      return NextResponse.json(
        { error: "পেমেন্ট তথ্য ইতিমধ্যে জমা দেওয়া হয়েছে" },
        { status: 409 },
      );
    }

    const $set: Record<string, unknown> = {
      "payment.gateway": gateway,
      "payment.transactionId": transactionId,
      "payment.senderAccount": senderAccount,
      "payment.submittedAt": new Date(),
      "payment.status": "processing",
      "payment.rejectionReason": undefined,
    };

    if (screenshotUrl) {
      $set["payment.screenshotUrl"] = screenshotUrl;
      $set["payment.screenshotDisplayUrl"] = screenshotDisplayUrl;
    }

    const activity = {
      _id: new mongoose.Types.ObjectId(),
      type: "payment_submitted",
      title: "পেমেন্ট তথ্য জমা দেওয়া হয়েছে",
      description: `${paymentMethod.name} এর মাধ্যমে পেমেন্ট জমা দেওয়া হয়েছে। TrxID: ${transactionId}${screenshotUrl ? " (স্ক্রিনশট সংযুক্ত)" : ""}`,
      performedByRole: "customer",
      isInternal: false,
      createdAt: new Date(),
    };

    await Order.findByIdAndUpdate(params.orderId, {
      $set,
      $push: { activities: activity },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
