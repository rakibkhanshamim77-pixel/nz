import mongoose, { Schema, Model, Types } from "mongoose";

export interface IContactReply {
  _id?: Types.ObjectId;
  adminId: Types.ObjectId;
  adminName: string;
  content: string;
  createdAt?: Date;
}

export interface IContactMessage {
  referenceId: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category:
    | "general"
    | "order"
    | "product"
    | "delivery"
    | "return_exchange"
    | "payment"
    | "complaint"
    | "other";
  orderId?: string;
  message: string;
  status: "new" | "read" | "in_progress" | "replied" | "resolved" | "closed";
  isRead: boolean;
  isImportant: boolean;
  replies: IContactReply[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ReplySchema = new Schema<IContactReply>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    adminName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: true },
);

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    referenceId: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["general", "order", "product", "delivery", "return_exchange", "payment", "complaint", "other"],
      required: true,
    },
    orderId: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "read", "in_progress", "replied", "resolved", "closed"],
      default: "new",
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    isImportant: { type: Boolean, default: false },
    replies: [ReplySchema],
  },
  { timestamps: true },
);

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ isRead: 1, createdAt: -1 });

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
