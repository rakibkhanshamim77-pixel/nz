const SMS_API = "https://api.nishchit.tech/v1/messages";

async function send(phone: string, body: string): Promise<void> {
  const apiKey = process.env.NISHCHIT_API_KEY;
  if (!apiKey) throw new Error("NISHCHIT_API_KEY env variable is not set");

  // phone is stored as 01XXXXXXXXX — prefix with country code
  const to = phone.startsWith("+") ? phone : `+88${phone}`;

  const res = await fetch(SMS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, body }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SMS API error ${res.status}: ${text}`);
  }
}

export async function sendOtp(phone: string, code: string): Promise<void> {
  await send(phone, `আপনার OTP কোড: ${code}`);
}

export async function sendOrderConfirmation(
  phone: string,
  name: string,
  orderNumber: string,
  totalAmount: number,
  paymentMethod: "cod" | "online",
): Promise<void> {
  const paymentLine =
    paymentMethod === "cod"
      ? "পেমেন্ট: ডেলিভারির সময় (ক্যাশ)"
      : "পেমেন্ট: যাচাই চলছে";

  const message = [
    `${name}, আপনার অর্ডার সফলভাবে গৃহীত হয়েছে।`,
    `অর্ডার নং: ${orderNumber}`,
    `মোট: ৳${totalAmount.toLocaleString("en-US")}`,
    paymentLine,
    `শীঘ্রই ডেলিভারি পাবেন। ধন্যবাদ।`,
  ].join("\n");

  await send(phone, message);
}
