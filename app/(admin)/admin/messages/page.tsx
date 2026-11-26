export const dynamic = "force-dynamic";

import AdminTopbar from "@/app/(admin)/_components/AdminTopbar";
import AdminBreadcrumb from "@/app/(admin)/_components/AdminBreadcrumb";
import { guardPage, getCurrentUser } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Conversation from "@/db/models/Conversation";
import InboxClient from "./_components/InboxClient";
import type { ConversationRow } from "@/lib/socket.types";

export default async function MessagesPage() {
  await guardPage("inbox_management");
  await dbConnect();

  const me = await getCurrentUser();
  const adminName = me?.name || me?.phone || "Admin";
  const adminId = me?.id || "";

  const rawConversations = await Conversation.find({})
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .lean();

  const conversations: ConversationRow[] = rawConversations.map((c) => ({
    _id: String(c._id),
    guestId: c.guestId,
    guestName: c.guestName,
    guestEmail: c.guestEmail,
    status: c.status,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt.toISOString(),
    unreadByAdmin: c.unreadByAdmin,
    unreadByCustomer: c.unreadByCustomer,
    isBlocked: c.isBlocked ?? false,
    createdAt: c.createdAt
      ? c.createdAt.toISOString()
      : new Date().toISOString(),
  }));

  return (
    <>
      <AdminTopbar />
      <main
        className="p-6"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <AdminBreadcrumb items={[{ label: "Messages" }]} />

        <InboxClient
          initialConversations={conversations}
          adminId={adminId}
          adminName={adminName}
        />
      </main>
    </>
  );
}
