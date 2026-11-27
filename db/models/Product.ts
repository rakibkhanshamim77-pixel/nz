import mongoose, { Schema, Model } from "mongoose";

export interface ISizeChartRow {
  size: string;
  chest?: number;
  length?: number;
  sleeve?: number; // add
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  regularPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  sku: string;
  images: string[];
  sizes: string[];
  colors: string[];
  /** Optional per-color image overrides: { "Black": ["url1", "url2"] } */
  colorImages?: Record<string, string[]>;
  features: string[];
  sizeChart: ISizeChartRow[];
  isFeatured: boolean;
  isActive: boolean;
  /** When set in the future, an active product stays hidden until this time */
  publishAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "Neeshanz",
      trim: true,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (images: string[]) => images.length > 0,
        message: "At least one product image is required",
      },
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    colorImages: {
      type: Schema.Types.Mixed,
      default: {},
    },
    features: {
      type: [String],
      default: [],
    },
    sizeChart: {
      type: [
        new Schema<ISizeChartRow>(
          {
            size: { type: String, required: true, trim: true, uppercase: true },
            chest: { type: Number, min: 0 },
            length: { type: Number, min: 0 },
            sleeve: { type: Number, min: 0 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ stock: 1 });
// Composite indexes for the most common published-product query patterns
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ isActive: 1, salePrice: 1 });

// Prevent model recompilation during Next.js hot reload
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
