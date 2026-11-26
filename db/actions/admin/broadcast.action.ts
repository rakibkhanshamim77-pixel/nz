"use server";

import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import { requirePermission } from "@/app/utils/authz";
import { sendBroadcastEmail } from "@/app/lib/email";

export interface BroadcastResult {
  sent: number;
  failed: number;
  total: number;
}

export async function broadcastEmail(
  message: string,
): Promise<{ success: true; result: BroadcastResult } | { success: false; error: string }> {
  const actor = await requirePermission("customers_management");
  if (!actor) return { success: false, error: "Permission denied." };

  if (!message.trim()) return { success: false, error: "Message cannot be empty." };
  if (message.trim().length > 2000) return { success: false, error: "Message must be under 2000 characters." };

  try {
    await dbConnect();

    // Get all unique customer emails from orders
    const rows = await Order.aggregate<{ _id: string }>([
      { $match: { "customer.email": { $exists: true, $ne: "" } } },
      { $group: { _id: { $toLower: "$customer.email" } } },
    ]);

    const emails = rows.map((r) => r._id).filter(Boolean);
    if (!emails.length) return { success: false, error: "No customer email addresses found." };

    let sent = 0;
    let failed = 0;

    // Send in batches of 5
    for (let i = 0; i < emails.length; i += 5) {
      const batch = emails.slice(i, i + 5);
      await Promise.all(
        batch.map((email) =>
          sendBroadcastEmail(email, message.trim())
            .then(() => { sent++; })
            .catch(() => { failed++; }),
        ),
      );
    }

    return { success: true, result: { sent, failed, total: emails.length } };
  } catch (err) {
    console.error("[broadcastEmail] failed:", err);
    return { success: false, error: "Failed to send emails. Please try again." };
  }
}
