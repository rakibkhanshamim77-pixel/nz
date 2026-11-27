"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCustomerSocket } from "@/lib/socket.client";
import type { MessageRow } from "@/lib/socket.types";
import { Send } from "lucide-react";

const GUEST_ID_KEY = "chat_guest_id";
const CONV_ID_KEY = "chat_conv_id";
const GUEST_NAME_KEY = "chat_guest_name";

function getOrCreateGuestId(): string {
  try {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = "g-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
  } catch {
    return "g-" + Math.random().toString(36).slice(2);
  }
}

function genClientId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TypingDots() {
  return (
    <div className="cw-typing-dots">
      <span style={{ animationDelay: "0ms" }} />
      <span style={{ animationDelay: "180ms" }} />
      <span style={{ animationDelay: "360ms" }} />
    </div>
  );
}

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MsgStatus = "sending" | "sent" | "failed";
interface LocalMessage extends MessageRow {
  _status?: MsgStatus;
  _clientId?: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [adminTyping, setAdminTyping] = useState(false);
  const [closed, setClosed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [unread, setUnread] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(false);
  const convIdRef = useRef<string | null>(null);

  const socket = getCustomerSocket();

  const joinConversation = useCallback(
    (savedName: string, savedConv: string | null) => {
      setConnecting(true);
      const guestId = getOrCreateGuestId();
      socket.emit("customer:start", {
        guestId,
        guestName: savedName,
        conversationId: savedConv || undefined,
      });
    },
    [socket],
  );

  useEffect(() => {
    setMounted(true);
    let savedName: string | null = null;
    let savedConv: string | null = null;
    try {
      savedName = localStorage.getItem(GUEST_NAME_KEY);
      savedConv = localStorage.getItem(CONV_ID_KEY);
    } catch {}

    if (savedName && savedConv) {
      setName(savedName);
      setConversationId(savedConv);
      convIdRef.current = savedConv;
      setStarted(true);
    }

    socket.connect();

    socket.on("connect", () => {
      if (savedName) {
        joinConversation(savedName, savedConv);
      }
    });

    socket.on(
      "customer:conversation_ready",
      ({ conversationId: id, status, isBlocked: blocked, messages: history }) => {
        setConversationId(id);
        convIdRef.current = id;
        setClosed(status === "closed");
        setBlocked(blocked);
        setConnecting(false);
        try {
          localStorage.setItem(CONV_ID_KEY, id);
        } catch {}
        if (history && history.length > 0) {
          setMessages(history.map((m) => ({ ...m, _status: "sent" as const })));
        }
      },
    );

    socket.on("new_message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, { ...msg, _status: "sent" as const }];
      });
      if (!openRef.current) setUnread((u) => u + 1);
    });

    socket.on("admin:typing", () => {
      setAdminTyping(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setAdminTyping(false), 3000);
    });

    socket.on("conversation:closed", () => setClosed(true));
    socket.on("conversation:reopened", () => { setClosed(false); setBlocked(false); });
    socket.on("customer:blocked", () => { setClosed(true); setBlocked(true); });
    socket.on("customer:unblocked", () => { setClosed(false); setBlocked(false); });
    socket.on("messages:deleted", () => setMessages([]));

    return () => {
      socket.off("connect");
      socket.off("customer:conversation_ready");
      socket.off("new_message");
      socket.off("admin:typing");
      socket.off("conversation:closed");
      socket.off("conversation:reopened");
      socket.off("customer:blocked");
      socket.off("customer:unblocked");
      socket.off("messages:deleted");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    openRef.current = open;
    if (open) {
      setUnread(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (started) inputRef.current?.focus();
        else nameInputRef.current?.focus();
      }, 150);
    }
  }, [open, started]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, adminTyping, open]);

  function startChat() {
    if (!nameInput.trim()) return;
    const n = nameInput.trim();
    setName(n);
    setStarted(true);
    try {
      localStorage.setItem(GUEST_NAME_KEY, n);
    } catch {}
    joinConversation(n, null);
  }

  function startNewConversation() {
    // Clear the old conversation from storage and state, then open a fresh one
    try {
      localStorage.removeItem(CONV_ID_KEY);
    } catch {}
    setConversationId(null);
    convIdRef.current = null;
    setMessages([]);
    setClosed(false);
    setBlocked(false);
    setConnecting(true);
    const guestId = getOrCreateGuestId();
    socket.emit("customer:start", { guestId, guestName: name });
  }

  function sendMessage() {
    if (!input.trim() || !conversationId) return;
    const content = input.trim();
    const clientId = genClientId();

    const optimistic: LocalMessage = {
      _id: clientId,
      conversationId,
      senderType: "customer",
      senderName: name,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      _status: "sending",
      _clientId: clientId,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    socket.emit(
      "customer:send_message",
      { conversationId, guestName: name, content, clientId },
      (res) => {
        if (res?.ok && res.message) {
          const serverMsg = res.message as MessageRow;
          setMessages((prev) =>
            prev.map((m) =>
              m._clientId === clientId
                ? {
                    ...serverMsg,
                    _status: "sent" as const,
                    _clientId: clientId,
                  }
                : m,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._clientId === clientId
                ? { ...m, _status: "failed" as const }
                : m,
            ),
          );
        }
      },
    );
  }

  function retryMessage(clientId: string) {
    const msg = messages.find((m) => m._clientId === clientId);
    if (!msg || !conversationId) return;

    setMessages((prev) =>
      prev.map((m) =>
        m._clientId === clientId ? { ...m, _status: "sending" as const } : m,
      ),
    );

    socket.emit(
      "customer:send_message",
      { conversationId, guestName: name, content: msg.content, clientId },
      (res) => {
        if (res?.ok && res.message) {
          const serverMsg = res.message as MessageRow;
          setMessages((prev) =>
            prev.map((m) =>
              m._clientId === clientId
                ? {
                    ...serverMsg,
                    _status: "sent" as const,
                    _clientId: clientId,
                  }
                : m,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._clientId === clientId
                ? { ...m, _status: "failed" as const }
                : m,
            ),
          );
        }
      },
    );
  }

  function handleTyping() {
    if (conversationId) socket.emit("customer:typing", conversationId);
  }

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes cw-slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cw-pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes cw-bounce {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .cw-window {
          animation: cw-slideUp 0.28s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .cw-pulse {
          animation: cw-pulseRing 1.6s ease-out infinite;
        }
        .cw-typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }
        .cw-typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #b0b0b0;
          animation: cw-bounce 1.4s ease-in-out infinite;
        }
        .cw-msg-enter {
          animation: cw-slideUp 0.2s ease-out;
        }
      `}</style>

      {/* Floating button — sits above the mobile nav bar on small screens */}
      <div className="fixed z-[60] lg:bottom-6 bottom-24" style={{ right: 24 }}>
        {!open && unread > 0 && (
          <span
            className="cw-pulse absolute inset-0 rounded-full"
            style={{ background: "#1a1a1a" }}
          />
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="লাইভ চ্যাট"
          className="relative flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(145deg,#1a1a1a 0%,#363636 100%)",
            color: "#fff",
            boxShadow: open
              ? "0 2px 12px rgba(0,0,0,0.2)"
              : "0 10px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <span
            className="transition-transform duration-300 flex"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            {open ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            )}
          </span>

          {!open && unread > 0 && (
            <span
              className="absolute flex items-center justify-center rounded-full text-[10px] font-black"
              style={{
                top: -4,
                right: -4,
                minWidth: 22,
                height: 22,
                padding: "0 6px",
                background: "#ef4444",
                color: "#fff",
                boxShadow: "0 0 0 3px #fff",
                lineHeight: 1,
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div
          className="cw-window fixed z-[59] flex flex-col overflow-hidden lg:bottom-24 bottom-[164px] h-[500px] max-h-[calc(100svh-180px)] lg:h-[580px] lg:max-h-[calc(100svh-116px)]"
          style={{
            right: 24,
            width: "min(400px, calc(100vw - 32px))",
            borderRadius: 24,
            background: "#fff",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 flex-shrink-0 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#0f0f0f 0%,#262626 100%)",
              color: "#fff",
            }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full"
              style={{
                background: "rgba(255,255,255,0.03)",
                transform: "translate(30%, -40%)",
              }}
            />

            <div
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                style={{ background: "#22c55e", border: "2.5px solid #0f0f0f" }}
              />
            </div>

            <div className="flex-1 min-w-0 relative">
              <p className="font-semibold text-[15px] leading-tight">
                Neeshanz Support
              </p>
              <p
                className="text-[12px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                সাধারণত কয়েক মিনিটে জবাব দেই
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-white/10"
              aria-label="বন্ধ করুন"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {!started ? (
            <div
              className="flex-1 flex flex-col px-5 pt-6 pb-5 overflow-y-auto"
              style={{ background: "#fafafa" }}
            >
              <div className="mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg,#111 0%,#333 100%)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#fff">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold" style={{ color: "#111" }}>
                  হ্যালো! 👋
                </h3>
                <p
                  className="text-[14px] mt-2 leading-relaxed"
                  style={{ color: "#6b7280" }}
                >
                  আমাদের টিম সবসময় আপনার সাহায্যের জন্য প্রস্তুত। নিচে আপনার
                  নাম দিয়ে চ্যাট শুরু করুন।
                </p>
              </div>

              <div className="mt-auto space-y-3">
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "#374151" }}
                >
                  আপনার নাম
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx={12} cy={7} r={4} />
                  </svg>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startChat()}
                    placeholder="আপনার নাম লিখুন…"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #e5e7eb",
                      color: "#111",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#111";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(0,0,0,0.06)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.04)";
                    }}
                  />
                </div>
                <button
                  onClick={startChat}
                  disabled={!nameInput.trim()}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-30 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#111 0%,#333 100%)",
                    color: "#fff",
                    boxShadow: nameInput.trim()
                      ? "0 4px 16px rgba(0,0,0,0.2)"
                      : "none",
                  }}
                >
                  চ্যাট শুরু করুন
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
                style={{ background: "#fafafa" }}
              >
                {/* Welcome bubble */}
                {messages.length === 0 && !connecting && (
                  <div className="flex items-end gap-2.5 mb-3 cw-msg-enter">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                      style={{ background: "#111", color: "#fff" }}
                    >
                      N
                    </div>
                    <div
                      className="px-4 py-3 text-[14px] max-w-[80%] leading-relaxed"
                      style={{
                        background: "#fff",
                        color: "#111",
                        borderRadius: "18px 18px 18px 6px",
                        border: "1px solid #eee",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      হ্যালো <span className="font-semibold">{name}</span>! 👋
                      কীভাবে সাহায্য করতে পারি?
                    </div>
                  </div>
                )}

                {connecting && (
                  <div className="flex justify-center py-8">
                    <div
                      className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
                      style={{
                        background: "#fff",
                        border: "1px solid #eee",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ color: "#aaa" }}
                      >
                        <circle
                          className="opacity-25"
                          cx={12}
                          cy={12}
                          r={10}
                          stroke="currentColor"
                          strokeWidth={4}
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                        />
                      </svg>
                      <span className="text-xs" style={{ color: "#999" }}>
                        সংযোগ করা হচ্ছে…
                      </span>
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMe = msg.senderType === "customer";
                  const prev = messages[i - 1];
                  const next = messages[i + 1];
                  const isGrouped =
                    prev &&
                    prev.senderType === msg.senderType &&
                    new Date(msg.createdAt).getTime() -
                      new Date(prev.createdAt).getTime() <
                      60000;
                  const isLastInGroup =
                    !next ||
                    next.senderType !== msg.senderType ||
                    new Date(next.createdAt).getTime() -
                      new Date(msg.createdAt).getTime() >=
                      60000;

                  const status = msg._status || "sent";

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2.5 cw-msg-enter ${isMe ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-3"}`}
                    >
                      {!isMe && (
                        <div style={{ width: 32, flexShrink: 0 }}>
                          {isLastInGroup && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                              style={{ background: "#111", color: "#fff" }}
                            >
                              N
                            </div>
                          )}
                        </div>
                      )}
                      <div className="max-w-[80%]">
                        <div
                          className="px-4 py-2.5 text-[14px] leading-relaxed"
                          style={{
                            background: isMe ? "#111" : "#fff",
                            color: isMe ? "#fff" : "#111",
                            borderRadius: isMe
                              ? "18px 18px 6px 18px"
                              : "18px 18px 18px 6px",
                            boxShadow: isMe
                              ? "0 2px 8px rgba(0,0,0,0.12)"
                              : "0 1px 4px rgba(0,0,0,0.04)",
                            border: isMe ? "none" : "1px solid #eee",
                            opacity: status === "sending" ? 0.6 : 1,
                          }}
                        >
                          {msg.content}
                        </div>
                        {isLastInGroup && (
                          <div
                            className={`flex items-center gap-1.5 text-[10px] mt-1 ${isMe ? "justify-end mr-1" : "ml-1"}`}
                            style={{ color: "#aaa" }}
                          >
                            <span>{formatMsgTime(msg.createdAt)}</span>
                            {isMe && status === "sending" && (
                              <span style={{ color: "#bbb" }}>
                                পাঠানো হচ্ছে…
                              </span>
                            )}
                            {isMe && status === "sent" && (
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                viewBox="0 0 24 24"
                              >
                                <path d="m5 12 5 5L20 7" />
                              </svg>
                            )}
                            {isMe && status === "failed" && (
                              <button
                                onClick={() =>
                                  msg._clientId && retryMessage(msg._clientId)
                                }
                                className="flex items-center gap-1 hover:underline"
                                style={{ color: "#ef4444" }}
                              >
                                ব্যর্থ · আবার চেষ্টা করুন
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {adminTyping && (
                  <div className="flex items-end gap-2.5 mt-3 cw-msg-enter">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                      style={{ background: "#111", color: "#fff" }}
                    >
                      N
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #eee",
                        borderRadius: "18px 18px 18px 6px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input / closed state */}
              {closed ? (
                <div
                  className="flex flex-col items-center gap-3 px-5 py-4 flex-shrink-0"
                  style={{ background: "#fff", borderTop: "1px solid #f0f0f0" }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#bbb" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx={12} cy={12} r={9} />
                      <path d="M12 8v.01M12 12v4" />
                    </svg>
                    <span className="text-xs" style={{ color: "#999" }}>
                      {blocked ? "আপনার অ্যাকাউন্ট সীমাবদ্ধ করা হয়েছে" : "এই কথোপকথন বন্ধ হয়ে গেছে"}
                    </span>
                  </div>
                  {!blocked && (
                    <button
                      onClick={startNewConversation}
                      className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg,#111 0%,#333 100%)",
                        color: "#fff",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                      নতুন কথোপকথন শুরু করুন
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
                  style={{ background: "#fff", borderTop: "1px solid #f0f0f0" }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                    onInput={handleTyping}
                    placeholder="বার্তা লিখুন…"
                    disabled={!conversationId}
                    className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={{
                      background: "#f4f4f5",
                      border: "1.5px solid transparent",
                      color: "#111",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#d4d4d8";
                      e.currentTarget.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.background = "#f4f4f5";
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !conversationId}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-25 hover:opacity-90 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#111 0%,#333 100%)",
                      color: "#fff",
                      boxShadow: input.trim()
                        ? "0 2px 10px rgba(0,0,0,0.2)"
                        : "none",
                    }}
                    aria-label="পাঠান"
                  >
                    <Send />
                  </button>
                </div>
              )}

              {/* Footer branding */}
              <div
                className="flex items-center justify-center py-2 flex-shrink-0"
                style={{ background: "#fff", borderTop: "1px solid #f8f8f8" }}
              >
                <span className="text-[10px]" style={{ color: "#c4c4c4" }}>
                  Powered by{" "}
                  <span className="font-semibold" style={{ color: "#aaa" }}>
                    Neeshanz
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
