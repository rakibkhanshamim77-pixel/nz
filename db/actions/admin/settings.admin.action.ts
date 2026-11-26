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
import { DEFAULT_BRANDING_SETTINGS, type BrandingSettings } from "@/db/settings";
import type { ActionResult } from "./types";

type SettingsResult = ActionResult<{ savedAt: string }, SettingsFieldKey>;
type BrandingResult = ActionResult<{ savedAt: string }>;

export async function saveBranding(payload: Partial<BrandingSettings>): Promise<BrandingResult> {
  const me = await requirePermission("settings");
  if (!me) return { ok: false, error: NOT_ALLOWED };

  const str = (v: unknown, fb: string) => (typeof v === "string" && v.trim() ? (v as string).trim() : fb);
  const d = DEFAULT_BRANDING_SETTINGS;
  const data: BrandingSettings = {
    shortName: str(payload.shortName, d.shortName),
    brandName: str(payload.brandName, d.brandName),
    tagline: str(payload.tagline, d.tagline),
    primaryColor: str(payload.primaryColor, d.primaryColor),
  };

  try {
    await dbConnect();
    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: { branding: data, updatedBy: new mongoose.Types.ObjectId(me.id) },
        $setOnInsert: { key: SETTINGS_KEY },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    revalidatePath("/", "layout");
    return { ok: true, data: { savedAt: new Date().toISOString() } };
  } catch (error) {
    console.error("[saveBranding]", error);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }
}

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

    // Delivery charges are read by the storefront, and the
    // low-stock threshold by the admin shell, so refresh everything.
    revalidatePath("/", "layout");

    return { ok: true, data: { savedAt: now.toISOString() } };
  } catch (error) {
    console.error("[updateSettings]", error);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }
}
