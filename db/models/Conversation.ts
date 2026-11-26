import mongoose, { Schema, Model, Types } from "mongoose";

export interface IConversation {
  guestId: string;
  userId?: Types.ObjectId;
  guestName: string;
  guestEmail?: string;
  status: "open" | "pending" | "closed";
  assignedTo?: Types.ObjectId;
  lastMessage: string;
  lastMessageAt: Date;
  unreadByAdmin: number;
  unreadByCustomer: number;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    guestId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    guestName: { type: String, required: true, trim: true },
    guestEmail: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "pending", "closed"],
      default: "open",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: String, default: "", trim: true },
    lastMessageAt: { type: Date, default: Date.now },
    unreadByAdmin: { type: Number, default: 1 },
    unreadByCustomer: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ConversationSchema.index({ status: 1, lastMessageAt: -1 });
ConversationSchema.index({ userId: 1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
