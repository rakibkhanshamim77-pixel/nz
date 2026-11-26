"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import ContactMessage from "@/db/models/ContactMessage";
import { getCurrentUser } from "@/app/utils/authz";
import type { IContactMessage } from "@/db/models/ContactMessage";

export type ContactMessageRow = {
  _id: string;
  referenceId: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: IContactMessage["category"];
  orderId?: string;
  message: string;
  status: IContactMessage["status"];
  isRead: boolean;
  isImportant: boolean;
  repliesCount: number;
  createdAt: string;
};

export type ContactMessageDetail = ContactMessageRow & {
  replies: {
    _id: string;
    adminId: string;
    adminName: string;
    content: string;
    createdAt: string;
  }[];
};

export type ContactStats = {
  total: number;
  new: number;
  unread: number;
  in_progress: number;
  replied: number;
  resolved: number;
  closed: number;
};

function toRow(c: IContactMessage & { _id: mongoose.Types.ObjectId }): ContactMessageRow {
  return {
    _id: String(c._id),
    referenceId: c.referenceId,
    name: c.name,
    email: c.email,
    phone: c.phone,
    subject: c.subject,
    category: c.category,
    orderId: c.orderId,
    message: c.message,
    status: c.status,
    isRead: c.isRead,
    isImportant: c.isImportant,
    repliesCount: c.replies?.length ?? 0,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function getContactMessages(query: {
  page?: number;
  search?: string;
  status?: string;
  category?: string;
  isRead?: string;
  sort?: "newest" | "oldest";
}): Promise<{ messages: ContactMessageRow[]; total: number }> {
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (query.status && query.status !== "all") filter.status = query.status;
  if (query.category && query.category !== "all") filter.category = query.category;
  if (query.isRead === "unread") filter.isRead = false;
  if (query.isRead === "read") filter.isRead = true;
  if (query.search?.trim()) {
    const re = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { name: re },
      { email: re },
      { phone: re },
      { referenceId: re },
      { orderId: re },
      { subject: re },
    ];
  }

  const limit = 20;
  const page = Math.max(1, query.page || 1);
  const skip = (page - 1) * limit;
  const sort = query.sort === "oldest" ? { createdAt: 1 as const } : { createdAt: -1 as const };

  const [docs, total] = await Promise.all([
    ContactMessage.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);

  return { messages: (docs as (IContactMessage & { _id: mongoose.Types.ObjectId })[]).map(toRow), total };
}

export async function getContactMessage(id: string): Promise<ContactMessageDetail | null> {
  await dbConnect();
  const doc = await ContactMessage.findById(id).lean();
  if (!doc) return null;
  const d = doc as IContactMessage & { _id: mongoose.Types.ObjectId };
  return {
    ...toRow(d),
    replies: (d.replies ?? []).map((r) => ({
      _id: String(r._id),
      adminId: String(r.adminId),
      adminName: r.adminName,
      content: r.content,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    })),
  };
}

export async function updateContactMessageStatus(
  id: string,
  status: IContactMessage["status"],
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Unauthorized" };
  await dbConnect();
  await ContactMessage.findByIdAndUpdate(id, { status });
  return { ok: true };
}

export async function markContactMessageRead(id: string): Promise<void> {
  await dbConnect();
  await ContactMessage.findByIdAndUpdate(id, { isRead: true, $set: { status: "read" } });
}

export async function markContactMessageImportant(
  id: string,
  value: boolean,
): Promise<void> {
  await dbConnect();
  await ContactMessage.findByIdAndUpdate(id, { isImportant: value });
}

export async function deleteContactMessage(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Unauthorized" };
  await dbConnect();
  await ContactMessage.findByIdAndDelete(id);
  return { ok: true };
}

export async function addContactReply(
  id: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (!content.trim()) return { ok: false, error: "Reply cannot be empty" };
  await dbConnect();
  await ContactMessage.findByIdAndUpdate(id, {
    $push: {
      replies: {
        adminId: new mongoose.Types.ObjectId(user.id),
        adminName: user.name || user.phone || "Admin",
        content: content.trim(),
      },
    },
    status: "replied",
    isRead: true,
  });
  return { ok: true };
}

export async function getContactStats(): Promise<ContactStats> {
  await dbConnect();
  const [total, newCount, unread, inProgress, replied, resolved, closed] = await Promise.all([
    ContactMessage.countDocuments({}),
    ContactMessage.countDocuments({ status: "new" }),
    ContactMessage.countDocuments({ isRead: false }),
    ContactMessage.countDocuments({ status: "in_progress" }),
    ContactMessage.countDocuments({ status: "replied" }),
    ContactMessage.countDocuments({ status: "resolved" }),
    ContactMessage.countDocuments({ status: "closed" }),
  ]);
  return { total, new: newCount, unread, in_progress: inProgress, replied, resolved, closed };
}
