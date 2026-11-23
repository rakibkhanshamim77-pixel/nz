"use server";

import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { requirePermission } from "@/app/utils/authz";
import { sendRawMessage } from "@/app/lib/sms";

export interface BroadcastResult {
  sent: number;
  failed: number;
  total: number;
}

export async function broadcastSms(
  message: string,
): Promise<{ success: true; result: BroadcastResult } | { success: false; error: string }> {
  const actor = await requirePermission("customers_management");
  if (!actor) return { success: false, error: "অনুমতি নেই।" };

  if (!message.trim()) return { success: false, error: "মেসেজ খালি রাখা যাবে না।" };
  if (message.trim().length > 500) return { success: false, error: "মেসেজ সর্বোচ্চ ৫০০ অক্ষর হতে পারবে।" };

  try {
    await dbConnect();

    // Get all unique phone numbers from orders
    const rows = await Order.aggregate<{ _id: string }>([
      { $group: { _id: { $toLower: "$customer.phone" } } },
    ]);

    const phones = rows.map((r) => r._id).filter(Boolean);
    if (!phones.length) return { success: false, error: "কোনো কাস্টমার ফোন নম্বর পাওয়া যায়নি।" };

    let sent = 0;
    let failed = 0;

    // Send in batches of 5 to avoid rate limits
    for (let i = 0; i < phones.length; i += 5) {
      const batch = phones.slice(i, i + 5);
      await Promise.all(
        batch.map((phone) =>
          sendRawMessage(phone, message.trim())
            .then(() => { sent++; })
            .catch(() => { failed++; }),
        ),
      );
    }

    return { success: true, result: { sent, failed, total: phones.length } };
  } catch (err) {
    console.error("[broadcast] failed:", err);
    return { success: false, error: "SMS পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" };
  }
}
