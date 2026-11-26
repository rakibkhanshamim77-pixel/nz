const SMS_API = "http://bulksmsbd.net/api/smsapi";

const BULKSMSBD_API_KEY = process.env.BULKSMSBD_API_KEY;
const BULKSMSBD_SENDER_ID = process.env.BULKSMSBD_SENDER_ID;

type PaymentMethod = "cod" | "online";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (/^01[3-9]\d{8}$/.test(digits)) {
    return `88${digits}`;
  }

  if (/^8801[3-9]\d{8}$/.test(digits)) {
    return digits;
  }

  throw new Error("Invalid Bangladesh phone number");
}

async function send(phone: string, message: string): Promise<void> {
  if (!BULKSMSBD_API_KEY) {
    throw new Error("BULKSMSBD_API_KEY is not configured");
  }

  if (!BULKSMSBD_SENDER_ID) {
    throw new Error("BULKSMSBD_SENDER_ID is not configured");
  }

  const number = normalizePhone(phone);

  const params = new URLSearchParams({
    api_key: BULKSMSBD_API_KEY,
    senderid: BULKSMSBD_SENDER_ID,
    number,
    message,
  });

  const response = await fetch(SMS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`BulkSMSBD HTTP Error ${response.status}: ${responseText}`);
  }

  let result: {
    response_code?: number;
    success_message?: string;
    error_message?: string;
  };

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid BulkSMSBD response: ${responseText}`);
  }

  if (result.response_code !== 202) {
    throw new Error(
      `BulkSMSBD Error ${result.response_code}: ${
        result.error_message || responseText
      }`,
    );
  }

  // SMS sent successfully — no logging to avoid leaking API internals
}

export async function sendOtp(phone: string, code: string): Promise<void> {
  if (!/^\d{4,8}$/.test(code)) {
    throw new Error("Invalid OTP code");
  }

  await send(
    phone,
    `Your Neeshanz OTP is ${code}. Do not share this code with anyone.`,
  );
}

function trackLink(orderNumber: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/track-order?orderId=${encodeURIComponent(orderNumber)}`;
}

const STATUS_MESSAGES: Record<string, (name: string, orderNumber: string) => string> = {
  confirmed: (name, num) =>
    `Hi ${name},\n\nYour order ${num} has been confirmed! 🎉\nWe will start preparing your items shortly.\n\nTrack your order:\n${trackLink(num)}\n\nShop more:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nThank you — Neeshanz`,

  processing: (name, num) =>
    `Hi ${name},\n\nYour order ${num} is now being processed! 📦\nOur team is packaging your items.\n\nTrack your order:\n${trackLink(num)}\n\nShop more:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nThank you — Neeshanz`,

  shipped: (name, num) =>
    `Hi ${name},\n\nYour order ${num} has been shipped! 🚚\nYour parcel is on its way and will arrive soon.\n\nTrack your order:\n${trackLink(num)}\n\nShop more:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nThank you — Neeshanz`,

  delivered: (name, num) =>
    `Hi ${name},\n\nYour order ${num} has been delivered! ✅\nWe hope you love your purchase.\n\nView order:\n${trackLink(num)}\n\nShop again:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nThank you for your trust and support ❤️\n— Neeshanz`,

  cancelled: (name, num) =>
    `Hi ${name},\n\nYour order ${num} has been cancelled.\nIf you have any questions, please contact us.\n\nView order:\n${trackLink(num)}\n\nContact us:\n${process.env.NEXT_PUBLIC_SITE_URL}/contact\n\nThank you — Neeshanz`,

  returned: (name, num) =>
    `Hi ${name},\n\nThe return process for your order ${num} has started.\nOur team will contact you shortly.\n\nView order:\n${trackLink(num)}\n\nContact us:\n${process.env.NEXT_PUBLIC_SITE_URL}/contact\n\nThank you — Neeshanz`,

  refunded: (name, num) =>
    `Hi ${name},\n\nYour refund for order ${num} has been processed. 💸\nPlease allow 3–7 business days for it to reach your payment method.\n\nView order:\n${trackLink(num)}\n\nShop again:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nThank you — Neeshanz`,
};

export async function sendRawMessage(phone: string, message: string): Promise<void> {
  await send(phone, message);
}

export async function sendOrderStatusUpdate(
  phone: string,
  name: string,
  orderNumber: string,
  status: string,
): Promise<void> {
  const builder = STATUS_MESSAGES[status];
  if (!builder) return; // no SMS for pending or unknown statuses
  const message = builder(name.trim(), orderNumber);
  await send(phone, message);
}

export async function sendOrderConfirmation(
  phone: string,
  name: string,
  orderNumber: string,
  totalAmount: number,
  paymentMethod: PaymentMethod,
): Promise<void> {
  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    throw new Error("Invalid order amount");
  }

  const paymentLine =
    paymentMethod === "cod"
      ? "Payment: Cash on Delivery"
      : "Payment: Awaiting verification";

  const message = [
    `Hi ${name.trim()},`,
    "",
    `Your order has been placed successfully! 🎉`,
    `Order No: ${orderNumber}`,
    `Total: ${totalAmount.toLocaleString("en-US")}`,
    paymentLine,
    "",
    `Track your order:\n${trackLink(orderNumber)}`,
    "",
    `Shop more:\n${process.env.NEXT_PUBLIC_SITE_URL}`,
    "",
    "Thank you for your trust ❤️",
    "— Neeshanz",
  ].join("\n");

  await send(phone, message);
}
