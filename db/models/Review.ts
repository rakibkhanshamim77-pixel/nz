import mongoose, {
  Schema,
  models,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const StoreReplySchema = new Schema(
  {
    /** e.g. "ধন্যবাদ, আবার আসবেন!" */
    text: { type: String, required: true, trim: true, maxlength: 500 },
    repliedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ReviewSchema = new Schema(
  {
    /** Product the review is for (optional for general store reviews) */
    product: { type: Schema.Types.ObjectId, ref: "Product", index: true },

    /** Customer display name — the avatar letter is taken from its first character */
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: 60,
    },

    /** Avatar background color */
    avatarColor: {
      type: String,
      default: "#3b82f6",
      match: [HEX_COLOR, "avatarColor must be a hex color"],
    },

    /** Small tag next to the name, e.g. "ক্রেতা" */
    badge: { type: String, trim: true, maxlength: 30, default: "ক্রেতা" },

    /** True only when the review is linked to a real, delivered order */
    isVerifiedPurchase: { type: Boolean, default: false },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },

    comment: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },

    /** Optional reply from the store, shown under the review */
    storeReply: { type: StoreReplySchema, default: undefined },

    /** Only published reviews should be shown on the site */
    isPublished: { type: Boolean, default: false },

    /** Pin to the home page Reviews section */
    isFeatured: { type: Boolean, default: false },

    /** Display order (ascending) */
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

ReviewSchema.index({ isPublished: 1, isFeatured: 1, order: 1 });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Reuse the compiled model during Next.js hot reloads
const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) ||
  model<ReviewDoc>("Review", ReviewSchema);

export default Review;
