"use server";

import dbConnect from "@/db/connect/dbConnect";
import ContactMessage, { type IContactMessage } from "@/db/models/ContactMessage";
import { createNotificationsForAdmins } from "./admin/notification.action";

const CATEGORIES = [
  "general",
  "order",
  "product",
  "delivery",
  "return_exchange",
  "payment",
  "complaint",
  "other",
] as const;

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  orderId?: string;
  message: string;
}

function generateReferenceId(): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF-${date}-${rand}`;
}

export async function submitContactMessage(
  input: ContactFormInput,
): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  if (!input.name?.trim()) return { success: false, error: "Name is required" };
  if (!input.email?.trim()) return { success: false, error: "Email is required" };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(input.email.trim()))
    return { success: false, error: "Please enter a valid email address" };
  if (!input.subject?.trim()) return { success: false, error: "Subject is required" };
  if (input.subject.trim().length > 200)
    return { success: false, error: "Subject must be 200 characters or less" };
  if (!CATEGORIES.includes(input.category as (typeof CATEGORIES)[number]))
    return { success: false, error: "Please select a valid inquiry category" };
  if (!input.message?.trim()) return { success: false, error: "Message is required" };
  if (input.message.trim().length < 20)
    return { success: false, error: "Message must be at least 20 characters" };
  if (input.message.trim().length > 2000)
    return { success: false, error: "Message must be 2000 characters or less" };

  try {
    await dbConnect();

    let referenceId = "";
    for (let i = 0; i < 3; i++) {
      const candidate = generateReferenceId();
      const exists = await ContactMessage.exists({ referenceId: candidate });
      if (!exists) { referenceId = candidate; break; }
    }
    if (!referenceId) return { success: false, error: "Failed to generate reference ID" };

    await ContactMessage.create({
      referenceId,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || undefined,
      subject: input.subject.trim(),
      category: input.category as IContactMessage["category"],
      orderId: input.orderId?.trim() || undefined,
      message: input.message.trim(),
      status: "new",
      isRead: false,
      isImportant: false,
      replies: [],
    });

    // Fire-and-forget notifications
    createNotificationsForAdmins(
      "new_contact",
      "নতুন যোগাযোগ বার্তা",
      `${input.name.trim()} — ${input.subject.trim()}`,
      `/admin/contact`,
      referenceId,
      `contact:${referenceId}`,
    ).catch(() => {});

    return { success: true, referenceId };
  } catch (err) {
    console.error("[contact] submitContactMessage failed:", err);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}
