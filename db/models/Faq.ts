import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const FaqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

FaqSchema.index({ order: 1 });

export type IFaq = InferSchemaType<typeof FaqSchema>;

const Faq: Model<IFaq> =
  mongoose.models.Faq || mongoose.model<IFaq>("Faq", FaqSchema);

export default Faq;
