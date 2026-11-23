import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "4000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let dbConnected = false;
async function ensureDB() {
  if (dbConnected) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  await mongoose.connect(uri);
  dbConnected = true;
}

app.prepare().then(async () => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/api/socketio",
  });

  async function getModels() {
    await ensureDB();
    const Conversation = (await import("./db/models/Conversation")).default;
    const Message = (await import("./db/models/Message")).default;
    return { Conversation, Message };
  }

  // ─── Admin namespace ─────────────────────────────────────────────────────────
  const adminNS = io.of("/admin-chat");

  adminNS.on("connection", (socket) => {
    console.log("[socket] admin connected:", socket.id);
    socket.join("admin-room");

    socket.on("admin:join_conversation", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
      socket.emit("admin:joined", conversationId);
    });

    socket.on("admin:leave_conversation", (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Admin sends a message
    socket.on(
      "admin:send_message",
      async (
        data: { conversationId: string; content: string; adminName: string; adminId: string },
        ack?: (res: { ok: boolean; message?: Record<string, unknown>; error?: string }) => void,
      ) => {
        try {
          const { Conversation, Message } = await getModels();
          const msg = await Message.create({
            conversationId: new mongoose.Types.ObjectId(data.conversationId),
            senderType: "admin",
            senderId: data.adminId ? new mongoose.Types.ObjectId(data.adminId) : undefined,
            senderName: data.adminName,
            content: data.content.trim(),
            isRead: false,
          });

          await Conversation.findByIdAndUpdate(data.conversationId, {
            lastMessage: data.content.trim(),
            lastMessageAt: new Date(),
            $inc: { unreadByCustomer: 1 },
            unreadByAdmin: 0,
          });

          const payload = {
            _id: String(msg._id),
            conversationId: data.conversationId,
            senderType: "admin" as const,
            senderName: data.adminName,
            content: data.content.trim(),
            isRead: false,
            createdAt: msg.createdAt ? (msg.createdAt as Date).toISOString() : new Date().toISOString(),
          };

          io.of("/customer-chat").to(`conv:${data.conversationId}`).emit("new_message", payload);
          socket.to(`conv:${data.conversationId}`).emit("new_message", payload);
          adminNS.to("admin-room").emit("conversation:updated", {
            conversationId: data.conversationId,
            lastMessage: data.content.trim(),
            lastMessageAt: payload.createdAt,
          });

          if (typeof ack === "function") ack({ ok: true, message: payload });
        } catch (err) {
          console.error("[socket] admin:send_message error:", err);
          if (typeof ack === "function") ack({ ok: false, error: "Failed to send" });
        }
      },
    );

    // Admin marks conversation as read
    socket.on("admin:mark_read", async (conversationId: string) => {
      try {
        const { Conversation, Message } = await getModels();
        await Conversation.findByIdAndUpdate(conversationId, { unreadByAdmin: 0 });
        await Message.updateMany(
          { conversationId: new mongoose.Types.ObjectId(conversationId), senderType: "customer", isRead: false },
          { isRead: true },
        );
      } catch (err) {
        console.error("[socket] admin:mark_read error:", err);
      }
    });

    // Admin closes / resolves a conversation
    socket.on("admin:close_conversation", async (conversationId: string) => {
      try {
        const { Conversation } = await getModels();
        await Conversation.findByIdAndUpdate(conversationId, { status: "closed" });
        io.of("/customer-chat").to(`conv:${conversationId}`).emit("conversation:closed");
        adminNS.to("admin-room").emit("conversation:status_changed", { conversationId, status: "closed" });
      } catch (err) {
        console.error("[socket] admin:close_conversation error:", err);
      }
    });

    // Admin reopens a conversation
    socket.on("admin:reopen_conversation", async (conversationId: string) => {
      try {
        const { Conversation } = await getModels();
        await Conversation.findByIdAndUpdate(conversationId, { status: "open" });
        io.of("/customer-chat").to(`conv:${conversationId}`).emit("conversation:reopened");
        adminNS.to("admin-room").emit("conversation:status_changed", { conversationId, status: "open" });
      } catch (err) {
        console.error("[socket] admin:reopen_conversation error:", err);
      }
    });

    // Admin sets arbitrary status (open / pending / closed)
    socket.on(
      "admin:set_status",
      async (data: { conversationId: string; status: "open" | "pending" | "closed" }) => {
        try {
          const { Conversation } = await getModels();
          await Conversation.findByIdAndUpdate(data.conversationId, { status: data.status });
          if (data.status === "closed") {
            io.of("/customer-chat").to(`conv:${data.conversationId}`).emit("conversation:closed");
          } else if (data.status === "open") {
            io.of("/customer-chat").to(`conv:${data.conversationId}`).emit("conversation:reopened");
          }
          adminNS.to("admin-room").emit("conversation:status_changed", {
            conversationId: data.conversationId,
            status: data.status,
          });
        } catch (err) {
          console.error("[socket] admin:set_status error:", err);
        }
      },
    );

    // Admin blocks a customer
    socket.on("admin:block_customer", async (conversationId: string) => {
      try {
        const { Conversation } = await getModels();
        await Conversation.findByIdAndUpdate(conversationId, { isBlocked: true, status: "closed" });
        io.of("/customer-chat").to(`conv:${conversationId}`).emit("customer:blocked");
        adminNS.to("admin-room").emit("conversation:status_changed", {
          conversationId,
          status: "closed",
          isBlocked: true,
        });
      } catch (err) {
        console.error("[socket] admin:block_customer error:", err);
      }
    });

    // Admin unblocks a customer
    socket.on("admin:unblock_customer", async (conversationId: string) => {
      try {
        const { Conversation } = await getModels();
        await Conversation.findByIdAndUpdate(conversationId, { isBlocked: false, status: "open" });
        io.of("/customer-chat").to(`conv:${conversationId}`).emit("customer:unblocked");
        adminNS.to("admin-room").emit("conversation:status_changed", {
          conversationId,
          status: "open",
          isBlocked: false,
        });
      } catch (err) {
        console.error("[socket] admin:unblock_customer error:", err);
      }
    });

    // Admin deletes all messages in a conversation
    socket.on(
      "admin:delete_messages",
      async (
        conversationId: string,
        ack?: (res: { ok: boolean; error?: string }) => void,
      ) => {
        try {
          const { Conversation, Message } = await getModels();
          await Message.deleteMany({ conversationId: new mongoose.Types.ObjectId(conversationId) });
          await Conversation.findByIdAndUpdate(conversationId, { lastMessage: "", unreadByAdmin: 0, unreadByCustomer: 0 });
          // Notify both sides to clear their message lists
          adminNS.to(`conv:${conversationId}`).emit("messages:deleted", conversationId);
          io.of("/customer-chat").to(`conv:${conversationId}`).emit("messages:deleted");
          if (typeof ack === "function") ack({ ok: true });
        } catch (err) {
          console.error("[socket] admin:delete_messages error:", err);
          if (typeof ack === "function") ack({ ok: false, error: "Failed to delete" });
        }
      },
    );

    socket.on("admin:typing", (conversationId: string) => {
      io.of("/customer-chat").to(`conv:${conversationId}`).emit("admin:typing");
    });

    socket.on("disconnect", () => {
      console.log("[socket] admin disconnected:", socket.id);
    });
  });

  // ─── Customer namespace ───────────────────────────────────────────────────────
  const customerNS = io.of("/customer-chat");

  customerNS.on("connection", (socket) => {
    console.log("[socket] customer connected:", socket.id);

    socket.on(
      "customer:start",
      async (data: {
        guestId: string;
        guestName: string;
        guestEmail?: string;
        userId?: string;
        conversationId?: string;
      }) => {
        try {
          const { Conversation, Message } = await getModels();

          let conversation;
          if (data.conversationId) {
            conversation = await Conversation.findById(data.conversationId);
          }

          if (!conversation) {
            conversation = await Conversation.findOne({
              guestId: data.guestId,
              status: { $ne: "closed" },
            });
          }

          // If blocked guest tries to start (no conversationId), check for blocked record
          if (!conversation && data.conversationId === undefined) {
            const blocked = await Conversation.findOne({ guestId: data.guestId, isBlocked: true });
            if (blocked) {
              const convId = String(blocked._id);
              socket.join(`conv:${convId}`);
              socket.emit("customer:conversation_ready", {
                conversationId: convId,
                status: "closed",
                isBlocked: true,
                messages: [],
              });
              return;
            }
          }

          const isNew = !conversation;
          if (!conversation) {
            conversation = await Conversation.create({
              guestId: data.guestId,
              userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
              guestName: data.guestName,
              guestEmail: data.guestEmail,
              lastMessage: "",
              lastMessageAt: new Date(),
              isBlocked: false,
            });

            adminNS.to("admin-room").emit("conversation:new", {
              _id: String(conversation._id),
              guestId: data.guestId,
              guestName: data.guestName,
              guestEmail: data.guestEmail,
              status: "open",
              lastMessage: "",
              lastMessageAt: new Date().toISOString(),
              unreadByAdmin: 0,
              unreadByCustomer: 0,
              isBlocked: false,
              createdAt: new Date().toISOString(),
            });
          }

          const convId = String(conversation._id);
          socket.join(`conv:${convId}`);

          let messages: Array<Record<string, unknown>> = [];
          if (!isNew) {
            const rawMessages = await Message.find({ conversationId: conversation._id })
              .sort({ createdAt: 1 })
              .limit(100)
              .lean();

            messages = rawMessages.map((m) => ({
              _id: String(m._id),
              conversationId: convId,
              senderType: m.senderType,
              senderName: m.senderName,
              content: m.content,
              isRead: m.isRead,
              createdAt: m.createdAt ? (m.createdAt as Date).toISOString() : new Date().toISOString(),
            }));
          }

          socket.emit("customer:conversation_ready", {
            conversationId: convId,
            status: conversation.status,
            isBlocked: conversation.isBlocked ?? false,
            messages,
          });
        } catch (err) {
          console.error("[socket] customer:start error:", err);
        }
      },
    );

    socket.on(
      "customer:send_message",
      async (
        data: { conversationId: string; guestName: string; content: string; clientId: string; userId?: string },
        ack?: (res: { ok: boolean; message?: Record<string, unknown>; error?: string }) => void,
      ) => {
        try {
          const { Conversation, Message } = await getModels();

          // Reject if conversation is blocked
          const conv = await Conversation.findById(data.conversationId);
          if (!conv || conv.isBlocked) {
            if (typeof ack === "function") ack({ ok: false, error: "Blocked" });
            return;
          }

          const msg = await Message.create({
            conversationId: new mongoose.Types.ObjectId(data.conversationId),
            senderType: "customer",
            senderId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
            senderName: data.guestName,
            content: data.content.trim(),
            isRead: false,
          });

          await Conversation.findByIdAndUpdate(data.conversationId, {
            lastMessage: data.content.trim(),
            lastMessageAt: new Date(),
            $inc: { unreadByAdmin: 1 },
            status: "open",
          });

          const payload = {
            _id: String(msg._id),
            conversationId: data.conversationId,
            senderType: "customer" as const,
            senderName: data.guestName,
            content: data.content.trim(),
            isRead: false,
            createdAt: msg.createdAt ? (msg.createdAt as Date).toISOString() : new Date().toISOString(),
          };

          socket.to(`conv:${data.conversationId}`).emit("new_message", payload);
          adminNS.to(`conv:${data.conversationId}`).emit("new_message", payload);
          adminNS.to("admin-room").emit("conversation:updated", {
            conversationId: data.conversationId,
            lastMessage: data.content.trim(),
            lastMessageAt: payload.createdAt,
            unreadByAdmin: true,
          });

          if (typeof ack === "function") ack({ ok: true, message: payload });
        } catch (err) {
          console.error("[socket] customer:send_message error:", err);
          if (typeof ack === "function") ack({ ok: false, error: "Failed to send" });
        }
      },
    );

    socket.on("customer:typing", (conversationId: string) => {
      adminNS.to(`conv:${conversationId}`).emit("customer:typing", conversationId);
    });

    socket.on("disconnect", () => {
      console.log("[socket] customer disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => { console.error(err); process.exit(1); })
    .listen(port, () => { console.log(`> Ready on http://${hostname}:${port}`); });
});
