import mongoose, { Schema, Model } from "mongoose";

/**
 * Slug-keyed singleton content blocks.
 * Each document = one configurable block of site content.
 * Slugs: "announcement" | "sale-banner" | "newsletter" |
 *        "delivery-exchange" | "about" | "terms" | "return-policy" | "privacy"
 */
const ContentSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    data: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export interface IContent {
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const Content: Model<IContent> =
  mongoose.models.Content || mongoose.model<IContent>("Content", ContentSchema);

export default Content;
