"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Settings, { SETTINGS_KEY } from "@/db/models/Settings";
import { getContactSettings as getContactSettingsFromDB } from "@/db/settings.server";
import { getCurrentUser } from "@/app/utils/authz";
import type { ContactSettings } from "@/db/settings";

export { getContactSettingsFromDB as getContactSettings };

export async function updateContactSettings(
  data: Partial<ContactSettings>,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  try {
    await dbConnect();
    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: { contact: data },
        updatedBy: new mongoose.Types.ObjectId(user.id),
      },
      { upsert: true, new: true },
    );
    return { ok: true };
  } catch (err) {
    console.error("[contact.settings] updateContactSettings failed:", err);
    return { ok: false, error: "Failed to save settings" };
  }
}
