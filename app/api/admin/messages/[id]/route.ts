import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/utils/authz";
import { userHasPermission } from "@/db/permissions";
import dbConnect from "@/db/connect/dbConnect";
import Message from "@/db/models/Message";
import Conversation from "@/db/models/Conversation";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const me = await getCurrentUser();
  if (!me || !userHasPermission(me, "inbox_management")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const messages = await Message.find({
    conversationId: new mongoose.Types.ObjectId(params.id),
  })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  return NextResponse.json({
    messages: messages.map((m) => ({
      _id: String(m._id),
      conversationId: String(m.conversationId),
      senderType: m.senderType,
      senderName: m.senderName,
      content: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
    })),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const me = await getCurrentUser();
  if (!me || !userHasPermission(me, "inbox_management")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  await Message.deleteMany({ conversationId: new mongoose.Types.ObjectId(params.id) });
  await Conversation.findByIdAndUpdate(params.id, { lastMessage: "", unreadByAdmin: 0, unreadByCustomer: 0 });

  return NextResponse.json({ ok: true });
}
