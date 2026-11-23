"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Notification from "@/db/models/Notification";
import User from "@/db/models/User";
import { getUser } from "@/app/utils/getUser";
import type { INotification } from "@/db/models/Notification";

export type NotificationRow = {
  _id: string;
  type: INotification["type"];
  title: string;
  message: string;
  targetUrl: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
};

export async function createNotificationsForAdmins(
  type: INotification["type"],
  title: string,
  message: string,
  targetUrl: string,
  relatedEntityId: string,
  eventId: string,
): Promise<void> {
  try {
    await dbConnect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admins = await User.find({
      $or: [
        { role: "admin" },
        { role: "moderator", permissions: { $exists: true, $ne: [] } },
      ],
    } as any)
      .select("_id")
      .lean();

    if (!admins.length) return;

    const docs = admins.map((a) => ({
      recipientAdminId: a._id,
      type,
      title,
      message,
      targetUrl,
      relatedEntityId,
      eventId,
      isRead: false,
    }));

    await Notification.insertMany(docs, { ordered: false }).catch(() => {});
  } catch (err) {
    console.error("[notifications] createNotificationsForAdmins failed:", err);
  }
}

export async function getAdminNotifications(
  adminId: string,
  page = 1,
  filter?: { type?: string; isRead?: boolean },
): Promise<{ notifications: NotificationRow[]; total: number; unread: number }> {
  await dbConnect();
  const query: Record<string, unknown> = {
    recipientAdminId: new mongoose.Types.ObjectId(adminId),
  };
  if (filter?.type) query.type = filter.type;
  if (typeof filter?.isRead === "boolean") query.isRead = filter.isRead;

  const limit = 20;
  const skip = (page - 1) * limit;

  const [docs, total, unread] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({
      recipientAdminId: new mongoose.Types.ObjectId(adminId),
      isRead: false,
    }),
  ]);

  return {
    notifications: docs.map((n) => ({
      _id: String(n._id),
      type: n.type,
      title: n.title,
      message: n.message,
      targetUrl: n.targetUrl,
      relatedEntityId: n.relatedEntityId,
      isRead: n.isRead,
      readAt: n.readAt?.toISOString(),
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    })),
    total,
    unread,
  };
}

export async function markNotificationRead(
  notificationId: string,
  adminId: string,
): Promise<void> {
  await dbConnect();
  await Notification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notificationId),
      recipientAdminId: new mongoose.Types.ObjectId(adminId),
    },
    { isRead: true, readAt: new Date() },
  );
}

export async function markAllNotificationsRead(adminId: string): Promise<void> {
  await dbConnect();
  await Notification.updateMany(
    {
      recipientAdminId: new mongoose.Types.ObjectId(adminId),
      isRead: false,
    },
    { isRead: true, readAt: new Date() },
  );
}

export async function deleteNotification(
  notificationId: string,
  adminId: string,
): Promise<void> {
  await dbConnect();
  await Notification.deleteOne({
    _id: new mongoose.Types.ObjectId(notificationId),
    recipientAdminId: new mongoose.Types.ObjectId(adminId),
  });
}

export async function getUnreadNotificationCount(adminId: string): Promise<number> {
  await dbConnect();
  return Notification.countDocuments({
    recipientAdminId: new mongoose.Types.ObjectId(adminId),
    isRead: false,
  });
}

export async function getMyUnreadCount(): Promise<number> {
  const user = await getUser();
  if (!user) return 0;
  return getUnreadNotificationCount(user.id);
}
