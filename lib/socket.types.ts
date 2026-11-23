export interface ConversationRow {
  _id: string;
  guestId: string;
  guestName: string;
  guestEmail?: string;
  status: "open" | "pending" | "closed";
  lastMessage: string;
  lastMessageAt: string;
  unreadByAdmin: number;
  unreadByCustomer: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface MessageRow {
  _id: string;
  conversationId: string;
  senderType: "customer" | "admin";
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendAck {
  ok: boolean;
  message?: MessageRow;
  error?: string;
}

export interface DeleteAck {
  ok: boolean;
  error?: string;
}

// Events emitted by admin client → server
export interface AdminEmitEvents {
  "admin:join_conversation": (conversationId: string) => void;
  "admin:leave_conversation": (conversationId: string) => void;
  "admin:send_message": (
    data: {
      conversationId: string;
      content: string;
      adminName: string;
      adminId: string;
    },
    ack?: (res: SendAck) => void,
  ) => void;
  "admin:mark_read": (conversationId: string) => void;
  "admin:close_conversation": (conversationId: string) => void;
  "admin:reopen_conversation": (conversationId: string) => void;
  "admin:set_status": (data: { conversationId: string; status: "open" | "pending" | "closed" }) => void;
  "admin:block_customer": (conversationId: string) => void;
  "admin:unblock_customer": (conversationId: string) => void;
  "admin:delete_messages": (conversationId: string, ack?: (res: DeleteAck) => void) => void;
  "admin:typing": (conversationId: string) => void;
}

// Events received by admin client ← server
export interface AdminListenEvents {
  "admin:joined": (conversationId: string) => void;
  new_message: (msg: MessageRow) => void;
  "conversation:new": (conv: ConversationRow) => void;
  "conversation:updated": (data: {
    conversationId: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadByAdmin?: boolean;
  }) => void;
  "conversation:status_changed": (data: {
    conversationId: string;
    status: string;
    isBlocked?: boolean;
  }) => void;
  "messages:deleted": (conversationId: string) => void;
  "conversation:closed": () => void;
  "customer:typing": (conversationId: string) => void;
}

// Events emitted by customer client → server
export interface CustomerEmitEvents {
  "customer:start": (data: {
    guestId: string;
    guestName: string;
    guestEmail?: string;
    userId?: string;
    conversationId?: string;
  }) => void;
  "customer:send_message": (
    data: {
      conversationId: string;
      guestName: string;
      content: string;
      clientId: string;
      userId?: string;
    },
    ack?: (res: SendAck) => void,
  ) => void;
  "customer:typing": (conversationId: string) => void;
}

// Events received by customer client ← server
export interface CustomerListenEvents {
  "customer:conversation_ready": (data: {
    conversationId: string;
    status: string;
    isBlocked: boolean;
    messages: MessageRow[];
  }) => void;
  new_message: (msg: MessageRow) => void;
  "admin:typing": () => void;
  "conversation:closed": () => void;
  "conversation:reopened": () => void;
  "customer:blocked": () => void;
  "customer:unblocked": () => void;
  "messages:deleted": () => void;
}
