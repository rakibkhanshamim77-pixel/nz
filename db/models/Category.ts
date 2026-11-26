import mongoose, {
  Schema,
  models,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const CategorySchema = new Schema(
  {
    /** Display name (Bengali), e.g. "বেসিক টি-শার্ট" */
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 80,
    },

    /** URL-friendly id, e.g. "basic-tshirt" */
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may only contain lowercase letters, numbers and hyphens",
      ],
    },

    /** Small English tag shown on the card, e.g. "Basic" */
    label: { type: String, trim: true, maxlength: 30 },

    /** Value used for data-filter / product filtering, e.g. "Basic" */
    filter: { type: String, required: true, trim: true },

    description: { type: String, trim: true, maxlength: 300, default: "" },

    /** Lowest product price in this category (BDT) — shown as "৳৪৯০ থেকে" */
    startingPrice: { type: Number, min: 0, default: 0 },

    /** Card background color */
    bgColor: {
      type: String,
      default: "#1f2937",
      match: [HEX_COLOR, "bgColor must be a hex color"],
    },

    /** Accent color for the tag, line and circle */
    accentColor: {
      type: String,
      default: "#cbd5e1",
      match: [HEX_COLOR, "accentColor must be a hex color"],
    },

    /** Display order (ascending) */
    order: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

CategorySchema.index({ isActive: 1, order: 1 });

export type CategoryDoc = InferSchemaType<typeof CategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

// Reuse the compiled model during Next.js hot reloads
const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) ||
  model<CategoryDoc>("Category", CategorySchema);

export default Category;
