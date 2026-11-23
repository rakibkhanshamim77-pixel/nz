import mongoose, { Schema, Model, Types } from "mongoose";

export interface INotification {
  recipientAdminId: Types.ObjectId;
  type: "new_order" | "new_contact" | "order_status" | "system";
  title: string;
  message: string;
  targetUrl: string;
  relatedEntityId?: string;
  eventId: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["new_order", "new_contact", "order_status", "system"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    targetUrl: { type: String, required: true, trim: true },
    relatedEntityId: { type: String, trim: true },
    eventId: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ recipientAdminId: 1, eventId: 1 }, { unique: true });
NotificationSchema.index({ recipientAdminId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
