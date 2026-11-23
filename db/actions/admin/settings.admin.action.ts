"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { requirePermission, NOT_ALLOWED } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Settings, { SETTINGS_KEY } from "@/db/models/Settings";
import {
  validateSettings,
  type SettingsFieldKey,
} from "@/db/validation/settings.validation";
import type { ActionResult } from "./types";

type SettingsResult = ActionResult<{ savedAt: string }, SettingsFieldKey>;

export async function updateSettings(payload: unknown): Promise<SettingsResult> {
  const me = await requirePermission("settings");
  if (!me) return { ok: false, error: NOT_ALLOWED };

  const result = validateSettings(payload);
  if (!result.ok)
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: result.errors };

  try {
    await dbConnect();
    const now = new Date();

    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: {
          ...result.data,
          updatedBy: new mongoose.Types.ObjectId(me.id),
        },
        $setOnInsert: { key: SETTINGS_KEY },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    // Delivery charges and payment wallets are read by the storefront, and the
    // low-stock threshold by the admin shell, so refresh everything.
    revalidatePath("/", "layout");

    return { ok: true, data: { savedAt: now.toISOString() } };
  } catch (error) {
    console.error("[updateSettings]", error);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }
}
