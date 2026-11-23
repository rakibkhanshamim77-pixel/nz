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
    `প্রিয় ${name},\n\nআপনার অর্ডার ${num} কনফার্ম হয়েছে! 🎉\nআমরা শীঘ্রই আপনার পণ্য প্রস্তুত করা শুরু করব।\n\nঅর্ডার ট্র্যাক করুন:\n${trackLink(num)}\n\nআরও কেনাকাটা করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nধন্যবাদ — Neeshanz`,

  processing: (name, num) =>
    `প্রিয় ${name},\n\nআপনার অর্ডার ${num} প্রসেসিং শুরু হয়েছে! 📦\nআমাদের টিম আপনার পণ্যটি প্যাকেজিং করছে।\n\nঅর্ডার ট্র্যাক করুন:\n${trackLink(num)}\n\nআরও কেনাকাটা করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nধন্যবাদ — Neeshanz`,

  shipped: (name, num) =>
    `প্রিয় ${name},\n\nআপনার অর্ডার ${num} শিপমেন্ট হয়েছে! 🚚\nআপনার পণ্য কুরিয়ারের মাধ্যমে পাঠানো হয়েছে এবং শীঘ্রই পৌঁছাবে।\n\nঅর্ডার ট্র্যাক করুন:\n${trackLink(num)}\n\nআরও কেনাকাটা করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nধন্যবাদ — Neeshanz`,

  delivered: (name, num) =>
    `প্রিয় ${name},\n\nআপনার অর্ডার ${num} ডেলিভারি সম্পন্ন হয়েছে! ✅\nআশা করি আপনি আমাদের পণ্য পছন্দ করেছেন।\n\nঅর্ডার দেখুন:\n${trackLink(num)}\n\nআবার কেনাকাটা করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nধন্যবাদ আপনার বিশ্বাস ও ভালোবাসার জন্য ❤️\n— Neeshanz`,

  cancelled: (name, num) =>
    `প্রিয় ${name},\n\nআপনার অর্ডার ${num} বাতিল করা হয়েছে।\nকোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।\n\nঅর্ডার দেখুন:\n${trackLink(num)}\n\nযোগাযোগ করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}/contact\n\nধন্যবাদ — Neeshanz`,

  returned: (name, num) =>
    `প্রিয় ${name},\n\nআপনার অর্ডার ${num} রিটার্ন প্রক্রিয়া শুরু হয়েছে।\nআমাদের টিম আপনার সাথে শীঘ্রই যোগাযোগ করবে।\n\nঅর্ডার দেখুন:\n${trackLink(num)}\n\nযোগাযোগ করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}/contact\n\nধন্যবাদ — Neeshanz`,

  refunded: (name, num) =>
    `প্রিয় ${name},\n\nআপনার অর্ডার ${num} রিফান্ড সম্পন্ন হয়েছে। 💸\nরিফান্ড আপনার পেমেন্ট পদ্ধতিতে পৌঁছাতে ৩-৭ কার্যদিবস লাগতে পারে।\n\nঅর্ডার দেখুন:\n${trackLink(num)}\n\nআবার কেনাকাটা করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\nধন্যবাদ — Neeshanz`,
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
      ? "পেমেন্ট: ক্যাশ অন ডেলিভারি"
      : "পেমেন্ট: যাচাইয়ের অপেক্ষায়";

  const message = [
    `প্রিয় ${name.trim()},`,
    "",
    `আপনার অর্ডার সফলভাবে গৃহীত হয়েছে! 🎉`,
    `অর্ডার নং: ${orderNumber}`,
    `মোট: ৳${totalAmount.toLocaleString("en-US")}`,
    paymentLine,
    "",
    `অর্ডার ট্র্যাক করুন:\n${trackLink(orderNumber)}`,
    "",
    `আরও কেনাকাটা করুন:\n${process.env.NEXT_PUBLIC_SITE_URL}`,
    "",
    "ধন্যবাদ আপনার বিশ্বাসের জন্য ❤️",
    "— Neeshanz",
  ].join("\n");

  await send(phone, message);
}
