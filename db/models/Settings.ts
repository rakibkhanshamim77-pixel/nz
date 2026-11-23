import mongoose, { Schema, Model } from "mongoose";
import type { StoreConfig } from "../settings";

/**
 * Singleton: exactly one document, found by `key`. Stored loosely with Mixed
 * groups so adding a setting doesn't need a migration — db/settings.ts fills in
 * anything missing via withDefaults().
 */
export interface ISettings extends Partial<StoreConfig> {
  key: string;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const SETTINGS_KEY = "store";

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: SETTINGS_KEY },
    store: { type: Schema.Types.Mixed, default: {} },
    delivery: { type: Schema.Types.Mixed, default: {} },
    payments: { type: Schema.Types.Mixed, default: {} },
    inventory: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
