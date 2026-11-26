"use client";

import { useEffect, useRef, useState } from "react";
import { getAdminSocket } from "@/lib/socket.client";
import type { ConversationRow, MessageRow } from "@/lib/socket.types";
import ConvList, { type TabKey } from "./ConvList";
import ChatPane from "./ChatPane";
import InfoPanel from "./InfoPanel";

interface Props {
  initialConversations: ConversationRow[];
  adminId: string;
  adminName: string;
}

/* ── toast helper ── */
let _toastTimer: ReturnType<typeof setTimeout> | null = null;
function showToast(msg: string) {
  const el = document.getElementById("inbox-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

export default function InboxClient({
  initialConversations,
  adminId,
  adminName,
}: Props) {
  const [conversations, setConversations] =
    useState<ConversationRow[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [infoOpen, setInfoOpen] = useState(false);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const socket = getAdminSocket();

  /* ── socket setup ── */
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("conversation:new", (conv) => {
      setConversations((prev) => [conv, ...prev]);
      showToast(`💬 New message from ${conv.guestName}`);
    });

    socket.on("conversation:updated", (data) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === data.conversationId
            ? {
                ...c,
                lastMessage: data.lastMessage,
                lastMessageAt: data.lastMessageAt,
                unreadByAdmin: data.unreadByAdmin
                  ? activeIdRef.current === c._id
                    ? 0
                    : c.unreadByAdmin + 1
                  : c.unreadByAdmin,
              }
            : c,
        ),
      );
    });

    socket.on(
      "conversation:status_changed",
      ({ conversationId, status, isBlocked }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId
              ? {
                  ...c,
                  status: status as ConversationRow["status"],
                  ...(isBlocked !== undefined ? { isBlocked } : {}),
                }
              : c,
          ),
        );
      },
    );

    socket.on("messages:deleted", (conversationId) => {
      if (conversationId === activeIdRef.current) {
        setMessages([]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, lastMessage: "" } : c,
        ),
      );
    });

    socket.on("new_message", (msg) => {
      if (msg.conversationId === activeIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    socket.on("customer:typing", (convId) => {
      if (convId === activeIdRef.current) {
        setTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 3000);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("conversation:new");
      socket.off("conversation:updated");
      socket.off("conversation:status_changed");
      socket.off("messages:deleted");
      socket.off("new_message");
      socket.off("customer:typing");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── open a conversation ── */
  async function openConversation(convId: string) {
    if (convId === activeId) {
      setMobileView("chat");
      document.body.classList.add("in-chat");
      return;
    }
    setLoading(true);
    setMessages([]);
    setTyping(false);
    if (activeId) socket.emit("admin:leave_conversation", activeId);
    socket.emit("admin:join_conversation", convId);
    socket.emit("admin:mark_read", convId);
    activeIdRef.current = convId;
    setActiveId(convId);
    setMobileView("chat");
    document.body.classList.add("in-chat");
    setConversations((prev) =>
      prev.map((c) => (c._id === convId ? { ...c, unreadByAdmin: 0 } : c)),
    );
    try {
      const res = await fetch(`/api/admin/messages/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoading(false);
    }
  }

  /* ── send reply ── */
  function sendMessage(content: string) {
    if (!content.trim() || !activeId || sending) return;
    setSending(true);
    const optId = `opt-${Date.now()}`;
    const opt: MessageRow = {
      _id: optId,
      conversationId: activeId,
      senderType: "admin",
      senderName: adminName,
      content,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, opt]);

    socket.emit(
      "admin:send_message",
      { conversationId: activeId, content, adminName, adminId },
      (res) => {
        if (res?.ok && res.message) {
          const serverMsg = res.message as MessageRow;
          setMessages((prev) =>
            prev.map((m) => (m._id === optId ? { ...serverMsg } : m)),
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === optId ? { ...m, _id: `fail-${Date.now()}` } : m,
            ),
          );
        }
        setSending(false);
      },
    );
  }

  /* ── send internal note (admin-only label, still a regular socket message) ── */
  function sendNote(content: string) {
    if (!content.trim() || !activeId) return;
    // Prefix so the thread shows the note styling
    const noteContent = `🔒 [Internal note]\n${content}`;
    sendMessage(noteContent);
    showToast("🔒 Note saved");
  }

  /* ── close / reopen conversation ── */
  function toggleStatus() {
    if (!activeId) return;
    const conv = conversations.find((c) => c._id === activeId);
    if (!conv) return;
    if (conv.status === "closed") {
      socket.emit("admin:reopen_conversation", activeId);
      showToast("Conversation reopened");
    } else {
      socket.emit("admin:close_conversation", activeId);
      showToast("✓ Conversation resolved");
    }
  }

  /* ── change status from info panel ── */
  function changeStatus(status: "open" | "pending" | "closed") {
    if (!activeId) return;
    socket.emit("admin:set_status", { conversationId: activeId, status });
    const labels = {
      open: "Reopened",
      pending: "Set to Waiting",
      closed: "✓ Resolved",
    };
    showToast(labels[status]);
  }

  /* ── block / unblock customer ── */
  function blockCustomer() {
    if (!activeId) return;
    if (
      !confirm(
        "Block this customer? They won't be able to start a new conversation.",
      )
    )
      return;
    socket.emit("admin:block_customer", activeId);
    showToast("🚫 Customer blocked");
  }

  function unblockCustomer() {
    if (!activeId) return;
    socket.emit("admin:unblock_customer", activeId);
    showToast("✓ Customer unblocked");
  }

  /* ── delete all messages ── */
  function deleteMessages() {
    if (!activeId) return;
    if (
      !confirm(
        "Delete all messages in this conversation? This cannot be undone.",
      )
    )
      return;
    socket.emit("admin:delete_messages", activeId, (res) => {
      if (res?.ok) {
        setMessages([]);
        showToast("🗑 All messages deleted");
      } else {
        showToast("Failed to delete messages");
      }
    });
  }

  /* ── mark all read ── */
  function markAllRead() {
    setConversations((prev) => prev.map((c) => ({ ...c, unreadByAdmin: 0 })));
    showToast("✓ All marked as read");
  }

  /* ── back to list (mobile) ── */
  function goBack() {
    setMobileView("list");
    document.body.classList.remove("in-chat");
  }

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "Escape") {
        setInfoOpen(false);
        document.body.classList.remove("info-open");
      }
      if (e.key === "/" && !typing) {
        e.preventDefault();
        (
          document.querySelector(
            ".inbox [placeholder='Search conversations']",
          ) as HTMLInputElement
        )?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ── resize: remove in-chat on tablet+ ── */
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) {
        document.body.classList.remove("in-chat");
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── on first load: open first unread on desktop ── */
  useEffect(() => {
    if (window.innerWidth >= 768 && conversations.length > 0) {
      const first =
        conversations.find((c) => c.unreadByAdmin > 0) || conversations[0];
      if (first) openConversation(first._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalUnread = conversations.reduce((s, c) => s + c.unreadByAdmin, 0);
  const activeConv = conversations.find((c) => c._id === activeId) ?? null;

  /* ── open/close info drawer (mobile <xl) ── */
  function toggleInfo() {
    const next = !infoOpen;
    setInfoOpen(next);
    document.body.classList.toggle("info-open", next);
  }
  function closeInfo() {
    setInfoOpen(false);
    document.body.classList.remove("info-open");
  }

  return (
    <>
      <div className="flex justify-between">
        <div className="mb-4">
          <h1 className="font-display font-extrabold text-[1.6rem] sm:text-[2rem] tracking-tight leading-tight">
            Inbox
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
            Real-time conversations with customers
          </p>
        </div>
        {/* ── Stats bar ── */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar mb-4 max-w-full">
          {[
            {
              label: "Open",
              value: conversations.filter((c) => c.status !== "closed").length,
              sub: "chats",
            },
            { label: "Unread", value: totalUnread, sub: "msgs" },
            {
              label: "Waiting",
              value: conversations.filter((c) => c.status === "pending").length,
              sub: "on cust.",
            },
            {
              label: "Resolved",
              value: conversations.filter((c) => c.status === "closed").length,
              sub: "total",
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="stat-card shrink-0">
              <span className="text-[11px] text-mute font-semibold uppercase tracking-wider block">
                {label}
              </span>
              <div className="flex items-baseline gap-2">
                <b className="font-display font-extrabold text-xl leading-tight">
                  {value}
                </b>
                <span className="text-[11px] text-mute">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Inbox grid ── */}
      <section
        className="card inbox"
        style={{
          height: "calc(100dvh - 72px - 180px)",
          minHeight: 480,
          borderRadius: 24,
        }}
        data-view={mobileView}
      >
        {/* LEFT: conversation list */}
        <ConvList
          conversations={conversations}
          activeId={activeId}
          filter={filter}
          search={search}
          totalUnread={totalUnread}
          connected={connected}
          onSelect={openConversation}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onMarkAllRead={markAllRead}
        />

        {/* MIDDLE: chat + composer */}
        <ChatPane
          conversation={activeConv}
          messages={messages}
          loading={loading}
          typing={typing}
          sending={sending}
          adminName={adminName}
          totalUnread={totalUnread}
          infoOpen={infoOpen}
          onSend={sendMessage}
          onNote={sendNote}
          onBack={goBack}
          onClose={toggleStatus}
          onToggleInfo={toggleInfo}
        />

        {/* RIGHT: info panel (xl+ only via CSS) */}
        <aside
          className="inbox-pane inbox-info flex-col"
          aria-label="Customer details"
        >
          <InfoPanel
            conversation={activeConv}
            messageCount={messages.length}
            onStatusChange={changeStatus}
            onBlock={blockCustomer}
            onUnblock={unblockCustomer}
            onDeleteMessages={deleteMessages}
          />
        </aside>
      </section>

      {/* ── Info drawer (mobile below xl) ── */}
      <div
        id="infoScrim"
        className="fixed inset-0 z-[64] bg-black/50 opacity-0 pointer-events-none transition-opacity"
        style={{
          opacity: infoOpen ? 1 : 0,
          pointerEvents: infoOpen ? "auto" : "none",
        }}
        onClick={closeInfo}
      />
      <aside className="info-drawer" aria-label="Customer details">
        <InfoPanel
          conversation={activeConv}
          messageCount={messages.length}
          onClose={closeInfo}
          onStatusChange={changeStatus}
          onBlock={blockCustomer}
          onUnblock={unblockCustomer}
          onDeleteMessages={deleteMessages}
        />
      </aside>

      {/* ── Toast ── */}
      <div
        id="inbox-toast"
        className="fixed left-1/2 bottom-6 z-[80] -translate-x-1/2 translate-y-5 opacity-0 pointer-events-none
          transition-all duration-200 card px-5 py-3 text-sm font-semibold"
        style={{ transitionProperty: "opacity, transform" }}
      />

      <style>{`
        #inbox-toast.show {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .thin { scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
        .thin::-webkit-scrollbar { width: 8px; }
        .thin::-webkit-scrollbar-thumb { background: var(--line); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
        .inp {
          width: 100%; height: 52px; padding: 0 16px;
          border-radius: 14px; border: 1px solid var(--line);
          background: var(--soft); color: var(--ink);
          font-size: 15px; outline: none;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .inp:focus { background: var(--surface); border-color: var(--ink); box-shadow: 0 0 0 4px color-mix(in srgb, var(--ink) 12%, transparent); }
        .inp::placeholder { color: color-mix(in srgb, var(--mute) 80%, transparent); }
        .btn-solid {
          display: inline-flex; align-items: center; gap: 8px;
          height: 44px; padding: 0 18px; border-radius: 14px;
          font-size: 14px; font-weight: 600; white-space: nowrap;
          background: var(--ink); color: var(--bg);
          transition: opacity 0.15s, transform 0.1s;
        }
        .btn-solid:hover { opacity: 0.88; }
        .btn-solid:active { transform: scale(0.98); }
        .btn-solid:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          height: 44px; padding: 0 18px; border-radius: 14px;
          font-size: 14px; font-weight: 600; white-space: nowrap;
          border: 1px solid var(--line); background: var(--surface); color: var(--ink);
          transition: border-color 0.15s, transform 0.1s;
        }
        .btn-ghost:hover:not(:disabled) { border-color: var(--ink); }
        .btn-ghost:active { transform: scale(0.98); }
        .btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }
        .icon-btn {
          width: 38px; height: 38px; border-radius: 12px;
          display: inline-grid; place-items: center;
          border: 1px solid var(--line); background: var(--surface); color: var(--ink);
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .icon-btn:hover { border-color: var(--ink); }
        .icon-btn:active { transform: scale(0.94); }
        .icon-btn.on { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .mono { font-family: ui-monospace, monospace; letter-spacing: 0.04em; }
      `}</style>
    </>
  );
}
