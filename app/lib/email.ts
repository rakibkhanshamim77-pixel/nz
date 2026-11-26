import nodemailer from "nodemailer";
import dbConnect from "@/db/connect/dbConnect";
import ContentModel from "@/db/models/Content";
import { CONTENT_DEFAULTS, type OrderEmailsContent } from "@/db/content";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASS must be set");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM = () => `"Neeshanz" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`;

function trackLink(orderNumber: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/track-order?orderId=${encodeURIComponent(orderNumber)}`;
}

function baseHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="background:#111;padding:24px 32px;">
      <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-.5px;">NEESHANZ</span>
      <span style="display:block;font-size:10px;letter-spacing:.25em;color:#aaa;margin-top:2px;">NEXT LEVEL TEES</span>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#111;font-weight:700;">${title}</h1>
      ${body}
    </div>
    <div style="padding:20px 32px;background:#f9f9f9;border-top:1px solid #eee;font-size:12px;color:#888;text-align:center;">
      Neeshanz · You received this because you placed an order with us.
    </div>
  </div>
</body></html>`;
}

async function getOrderEmailTemplates(): Promise<OrderEmailsContent> {
  try {
    await dbConnect();
    const doc = await ContentModel.findOne({ slug: "order-emails" }).select("data").lean();
    const defaults = CONTENT_DEFAULTS["order-emails"];
    if (!doc?.data) return defaults;
    return { ...defaults, ...(doc.data as Partial<OrderEmailsContent>) };
  } catch {
    return CONTENT_DEFAULTS["order-emails"];
  }
}

function applyVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

type StatusKey = "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "refunded";
const STATUS_SUBJECT_KEY: Record<StatusKey, keyof OrderEmailsContent> = {
  confirmed: "confirmedSubject",
  processing: "processingSubject",
  shipped: "shippedSubject",
  delivered: "deliveredSubject",
  cancelled: "cancelledSubject",
  returned: "returnedSubject",
  refunded: "refundedSubject",
};
const STATUS_BODY_KEY: Record<StatusKey, keyof OrderEmailsContent> = {
  confirmed: "confirmedBody",
  processing: "processingBody",
  shipped: "shippedBody",
  delivered: "deliveredBody",
  cancelled: "cancelledBody",
  returned: "returnedBody",
  refunded: "refundedBody",
};

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!/^\d{4,8}$/.test(code)) throw new Error("Invalid OTP code");

  const transport = createTransport();
  await transport.sendMail({
    from: FROM(),
    to: email,
    subject: `Your Neeshanz verification code: ${code}`,
    text: `Your verification code is ${code}. It expires in 5 minutes. Do not share it with anyone.`,
    html: baseHtml("Verify your email", `
      <p style="color:#555;margin:0 0 24px;font-size:15px;">Use the code below to complete your registration on Neeshanz.</p>
      <div style="letter-spacing:10px;font-size:36px;font-weight:700;color:#111;text-align:center;padding:20px;background:#f4f4f5;border-radius:8px;margin-bottom:24px;">${code}</div>
      <p style="color:#888;font-size:13px;margin:0;">This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
    `),
  });
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
): Promise<void> {
  const subjectKey = STATUS_SUBJECT_KEY[status as StatusKey];
  const bodyKey = STATUS_BODY_KEY[status as StatusKey];
  if (!subjectKey || !bodyKey) return;

  const templates = await getOrderEmailTemplates();
  const vars = { name: name.trim(), orderNumber };

  const subject = applyVars(templates[subjectKey] as string, vars);
  const bodyText = applyVars(templates[bodyKey] as string, vars);

  const ctaHref = status === "cancelled" ? `${process.env.NEXT_PUBLIC_SITE_URL}/contact` : trackLink(orderNumber);
  const ctaLabel = status === "delivered" || status === "cancelled" || status === "returned" || status === "refunded"
    ? (status === "cancelled" ? "Contact Us" : "View Order")
    : "Track Your Order";

  const body = `<p style="color:#444;line-height:1.6;margin:0 0 16px;">Hi <b>${name.trim()}</b>,</p>
<p style="color:#444;line-height:1.6;margin:0 0 20px;">${bodyText}</p>
<a href="${ctaHref}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${ctaLabel}</a>`;

  const transport = createTransport();
  await transport.sendMail({
    from: FROM(),
    to: email,
    subject,
    html: baseHtml(subject, body),
    text: `${bodyText}\n\n${ctaHref}`,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  totalAmount: number,
  paymentMethod: "cod" | "online",
): Promise<void> {
  const paymentLine =
    paymentMethod === "cod"
      ? "Payment: Cash on Delivery — pay when you receive your order"
      : "Payment: Awaiting verification";

  const templates = await getOrderEmailTemplates();
  const vars = { name: name.trim(), orderNumber };
  const subject = applyVars(templates.placedSubject, vars);
  const bodyText = applyVars(templates.placedBody, vars);

  const transport = createTransport();
  await transport.sendMail({
    from: FROM(),
    to: email,
    subject,
    html: baseHtml(subject, `
      <p style="color:#444;line-height:1.6;margin:0 0 16px;">Hi <b>${name.trim()}</b>,</p>
      <p style="color:#444;line-height:1.6;margin:0 0 20px;">${bodyText}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 12px;background:#f4f4f5;border-radius:8px 8px 0 0;font-size:13px;color:#888;">Order Number</td>
          <td style="padding:10px 12px;background:#f4f4f5;border-radius:8px 8px 0 0;font-size:14px;font-weight:700;color:#111;text-align:right;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;background:#fafafa;font-size:13px;color:#888;">Total Amount</td>
          <td style="padding:10px 12px;background:#fafafa;font-size:14px;font-weight:700;color:#111;text-align:right;">${totalAmount.toLocaleString("en-US")}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;background:#f4f4f5;border-radius:0 0 8px 8px;font-size:13px;color:#888;">Payment</td>
          <td style="padding:10px 12px;background:#f4f4f5;border-radius:0 0 8px 8px;font-size:13px;color:#555;text-align:right;">${paymentLine}</td>
        </tr>
      </table>
      <a href="${trackLink(orderNumber)}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Track Your Order</a>
      <p style="color:#888;font-size:13px;margin:24px 0 0;">
        If you have any questions, please contact our support team. Thank you for shopping with us ❤️
      </p>
    `),
    text: `Hi ${name},\n\nThank you for your order!\n\nOrder: ${orderNumber}\nTotal: ${totalAmount.toLocaleString("en-US")}\n${paymentLine}\n\nTrack: ${trackLink(orderNumber)}\n\n— Neeshanz`,
  });
}

export async function sendBroadcastEmail(email: string, message: string): Promise<void> {
  const transport = createTransport();
  const escaped = message.replace(/\n/g, "<br>");
  await transport.sendMail({
    from: FROM(),
    to: email,
    subject: "Message from Neeshanz",
    html: baseHtml("Message from Neeshanz", `<p style="color:#444;line-height:1.7;margin:0;">${escaped}</p>`),
    text: message,
  });
}
