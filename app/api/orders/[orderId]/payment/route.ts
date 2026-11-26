import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { SESSION_COOKIE, verifySession } from "@/app/utils/session";
import { verifyGuestToken } from "@/lib/guestToken";
import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { getPaymentMethod } from "@/lib/paymentConfig";
import { MAX_IMAGE_BYTES as MAX_FILE_SIZE } from "@/db/utils/imageHosts";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR ?? "/var/www/neeshanz-uploads";
const UPLOADS_URL_BASE = (process.env.NEXT_PUBLIC_UPLOADS_URL ?? "https://neeshanz.com/uploads").replace(/\/$/, "");

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
  if (!gateway) return NextResponse.json({ error: "Please select a payment method" }, { status: 400 });
  if (!transactionId) return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
  if (transactionId.length < 6 || transactionId.length > 30) {
    return NextResponse.json({ error: "Transaction ID must be 6–30 characters" }, { status: 400 });
  }
  if (!senderAccount) return NextResponse.json({ error: "Sender account number is required" }, { status: 400 });

  const phoneRegex = /^01[3-9]\d{8}$/;
  if (!phoneRegex.test(senderAccount.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Please enter a valid Bangladesh mobile number" }, { status: 400 });
  }

  // Validate gateway is configured
  const paymentMethod = await getPaymentMethod(gateway);
  if (!paymentMethod) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  // Screenshot is optional but if provided, validate it
  let screenshotUrl: string | undefined;
  let screenshotDisplayUrl: string | undefined;

  if (screenshot && screenshot.size > 0) {
    if (!ALLOWED_TYPES.includes(screenshot.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or WebP images are allowed" }, { status: 400 });
    }
    if (screenshot.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image size must not exceed 5 MB" }, { status: 400 });
    }

    // Upload screenshot to VPS storage
    try {
      const buffer = Buffer.from(await screenshot.arrayBuffer());
      const ext = (() => {
        if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
        if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
        if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
        return "jpg";
      })();
      const unique = `${Date.now()}-${randomBytes(4).toString("hex")}-screenshot.${ext}`;
      const targetDir = path.join(UPLOAD_BASE_DIR, "screenshots");
      const filePath = path.join(targetDir, unique);

      if (!existsSync(targetDir)) await mkdir(targetDir, { recursive: true });
      await writeFile(filePath, buffer);

      screenshotUrl = `${UPLOADS_URL_BASE}/screenshots/${unique}`;
      screenshotDisplayUrl = screenshotUrl;
    } catch {
      return NextResponse.json({ error: "Screenshot upload failed. Please try again." }, { status: 502 });
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
        { error: "Payment details have already been submitted" },
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
      title: "Payment Submitted",
      description: `Payment submitted via ${paymentMethod.name}. TrxID: ${transactionId}${screenshotUrl ? " (screenshot attached)" : ""}`,
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
