import mongoose, { Schema, Model, Types } from "mongoose";

export interface IMessage {
  conversationId: Types.ObjectId;
  senderType: "customer" | "admin";
  senderId?: Types.ObjectId;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderType: { type: String, enum: ["customer", "admin"], required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    senderName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
