import mongoose, {
  Schema,
  models,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

export const NEWSLETTER_STATUSES = ["subscribed", "unsubscribed"] as const;

const NewsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email"],
    },

    status: {
      type: String,
      enum: NEWSLETTER_STATUSES,
      default: "subscribed",
      index: true,
    },

    /** Where the signup came from, e.g. "home-newsletter" */
    source: { type: String, trim: true, default: "home-newsletter" },

    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date, default: null },

    /** Set when the first-order discount code has been emailed */
    discountCodeSentAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

export type NewsletterDoc = InferSchemaType<typeof NewsletterSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Reuse the compiled model during Next.js hot reloads
const Newsletter: Model<NewsletterDoc> =
  (models.Newsletter as Model<NewsletterDoc>) ||
  model<NewsletterDoc>("Newsletter", NewsletterSchema);

export default Newsletter;
