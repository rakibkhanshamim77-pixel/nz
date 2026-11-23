"use client";

import { useEffect, useRef, useState } from "react";
import type { ConversationRow, MessageRow } from "@/lib/socket.types";

const CANNED = [
  ["স্বাগতম", "আসসালামু আলাইকুম! NEESHANZ এ আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?"],
  ["পেমেন্ট যাচাই", "আপনার পেমেন্ট আমরা যাচাই করছি, ৫–১০ মিনিটের মধ্যে অর্ডার কনফার্ম হয়ে যাবে।"],
  ["TrxID চাই", "অনুগ্রহ করে bKash/Nagad এর TrxID এবং যে নম্বর থেকে পাঠিয়েছেন সেটি জানাবেন।"],
  ["সাইজ গাইড", 'আমাদের সাইজ চার্ট: M (বুক ৩৯"), L (বুক ৪১"), XL (বুক ৪৩"), XXL (বুক ৪৫")।'],
  ["ডেলিভারি সময়", "ঢাকার ভেতরে ১–২ দিন, ঢাকার বাইরে ৩–৫ কর্মদিবসে ডেলিভারি হয়।"],
  ["এক্সচেঞ্জ পলিসি", "পণ্য হাতে পাওয়ার ৩ দিনের মধ্যে সাইজ এক্সচেঞ্জ করা যাবে।"],
  ["ট্র্যাকিং কোড", "আপনার অর্ডারটি কুরিয়ারে হস্তান্তর হয়েছে। ট্র্যাকিং পেজে অর্ডার নম্বর দিন।"],
  ["ধন্যবাদ", "আপনার সাথে কথা বলে ভালো লাগল। আর কোনো সাহায্য লাগলে জানাবেন। ধন্যবাদ! 🖤"],
];

const EMOJIS = ["😊","🙏","👍","❤️","🖤","🎉","😍","🙌","✅","📦","🚚","💳","⏳","😅","🤝","✨","😂","🫡","👌","💯","🔥","⚡","✓","🫶"];

interface Props {
  conversation: ConversationRow | null;
  messages: MessageRow[];
  loading: boolean;
  typing: boolean;
  sending: boolean;
  adminName: string;
  totalUnread: number;
  onSend: (content: string) => void;
  onNote: (content: string) => void;
  onBack: () => void;
  onClose: () => void;
  onToggleInfo: () => void;
}

function ini(name: string) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dayKey(iso: string) {
  return new Date(iso).toDateString();
}

function dayLabel(iso: string) {
  const k = dayKey(iso);
  if (k === new Date().toDateString()) return "Today";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (k === y.toDateString()) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ChatPane({
  conversation,
  messages,
  loading,
  typing,
  sending,
  totalUnread,
  onSend,
  onNote,
  onBack,
  onClose,
  onToggleInfo,
}: Props) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [popQR, setPopQR] = useState(false);
  const [qrFilter, setQRFilter] = useState("");
  const [popEmo, setPopEmo] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!conversation) return;
    setInput("");
    setMode("reply");
    setPopQR(false);
    setPopEmo(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?._id]);

  function autosize(ta: HTMLTextAreaElement) {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setInput(v);
    autosize(e.target);
    if (/^\/\S*$/.test(v)) {
      setQRFilter(v.slice(1));
      setPopQR(true);
      setPopEmo(false);
    } else {
      setPopQR(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (popQR) {
      if (e.key === "Escape") { setPopQR(false); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  }

  function doSend() {
    const v = input.trim();
    if (!v || sending) return;
    if (mode === "note") {
      onNote(v);
    } else {
      onSend(v);
    }
    setInput("");
    setPopQR(false);
    setPopEmo(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function pickQR(body: string) {
    setInput(body);
    setPopQR(false);
    setTimeout(() => {
      if (textareaRef.current) {
        autosize(textareaRef.current);
        textareaRef.current.focus();
      }
    }, 50);
  }

  function pickEmo(e: string) {
    setInput((v) => v + e);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  const filteredQR = CANNED.filter(
    ([t, b]) =>
      !qrFilter || (t + b).toLowerCase().includes(qrFilter.toLowerCase()),
  );

  /* ── Empty state ── */
  if (!conversation) {
    return (
      <div className="inbox-pane chat-pane flex-1 thread-bg">
        <div className="flex flex-col items-center justify-center gap-5 h-full px-8 text-center">
          <div
            className="w-20 h-20 rounded-3xl grid place-items-center"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
          >
            <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
            </svg>
          </div>
          <div className="max-w-xs">
            <b className="font-display text-xl block">Select a conversation</b>
            <p className="text-sm text-mute mt-1.5">
              Pick a chat from the left to reply to customers in real time.
            </p>
            <p className="text-xs text-mute mt-5 flex items-center justify-center gap-2 flex-wrap">
              <span className="kbd-hint">/</span> search
              <span className="kbd-hint">↑</span>
              <span className="kbd-hint">↓</span> navigate
              <span className="kbd-hint">Enter</span> send
            </p>
          </div>
          {totalUnread > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
              {totalUnread} unread message{totalUnread > 1 ? "s" : ""} waiting
            </div>
          )}
        </div>
      </div>
    );
  }

  const resolved = conversation.status === "closed";
  const statusLabel =
    conversation.status === "open" ? "Open" :
    conversation.status === "pending" ? "Waiting" : "Resolved";
  const statusColor =
    conversation.status === "open" ? "#22c55e" :
    conversation.status === "pending" ? "#f59e0b" : "var(--mute)";

  return (
    <div className="inbox-pane chat-pane flex-1" style={{ minWidth: 0 }}>
      {/* ── Chat header ── */}
      <div
        className="h-[72px] px-3 sm:px-5 flex items-center gap-3 border-b border-line shrink-0"
        style={{ background: "var(--surface)" }}
      >
        {/* Mobile back */}
        <button
          type="button"
          className="icon-btn md:!hidden"
          aria-label="Back to list"
          onClick={onBack}
        >
          <svg fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" className="w-[17px] h-[17px]">
            <path d="M15 6 9 12l6 6" />
          </svg>
        </button>

        {/* Avatar */}
        <span className="av-box">
          {ini(conversation.guestName)}
          <span
            className="av-dot"
            style={{ background: statusColor, borderColor: "var(--surface)" }}
          />
        </span>

        <div className="min-w-0 flex-1">
          <b className="block font-display text-[15.5px] truncate">{conversation.guestName}</b>
          <span className="text-xs text-mute flex items-center gap-1.5 truncate">
            <span className="sdot-s" style={{ background: statusColor }} />
            {statusLabel}
            {conversation.guestEmail ? ` · ${conversation.guestEmail}` : ""}
          </span>
        </div>

        {/* Resolve / Reopen */}
        <button
          type="button"
          className={`${resolved ? "btn-ghost" : "btn-solid"} !h-[38px] !px-3.5 text-[13px]`}
          onClick={onClose}
        >
          {resolved ? (
            "Reopen"
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path d="m5 12 5 5L20 7" />
              </svg>
              <span className="hidden sm:inline">Resolve</span>
            </>
          )}
        </button>

        {/* Info panel toggle */}
        <button
          type="button"
          className="icon-btn"
          aria-label="Customer details"
          onClick={onToggleInfo}
        >
          <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-[17px] h-[17px]">
            <circle cx={12} cy={12} r={9} />
            <path d="M12 11v5M12 8h.01" />
          </svg>
        </button>
      </div>

      {/* ── Thread ── */}
      <div
        id="thread"
        className="flex-1 overflow-y-auto thin thread-bg px-3 sm:px-6 py-3"
        aria-live="polite"
      >
        {loading && (
          <div className="flex justify-center py-10">
            <svg className="w-6 h-6 animate-spin text-mute" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 h-full text-center py-16">
            <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
            </svg>
            <p className="text-sm text-mute">No messages yet</p>
          </div>
        )}

        {!loading && (() => {
          const nodes: React.ReactNode[] = [];
          let lastDay = "";

          messages.forEach((msg, i) => {
            const dk = dayKey(msg.createdAt);
            if (dk !== lastDay) {
              lastDay = dk;
              nodes.push(
                <div key={`day-${dk}`} className="day-div">
                  <span>{dayLabel(msg.createdAt)}</span>
                </div>,
              );
            }

            const isAdmin = msg.senderType === "admin";
            const prev = messages[i - 1];
            const isFirst =
              !prev ||
              prev.senderType !== msg.senderType ||
              dayKey(prev.createdAt) !== dk ||
              new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60000;

            const isOpt = msg._id.startsWith("opt-");

            nodes.push(
              <div
                key={msg._id}
                className={`msg-row ${isAdmin ? "me" : ""} ${isFirst ? "first" : ""}`}
              >
                {/* Customer avatar */}
                {!isAdmin && (
                  <span className={`av-box sm alt shrink-0 self-end ${isFirst ? "" : "invisible"}`}>
                    {ini(msg.senderName)}
                  </span>
                )}

                <div className="bubble" style={{ opacity: isOpt ? 0.6 : 1 }}>
                  {msg.content}
                  <div className="msg-meta">
                    <span>{hhmm(msg.createdAt)}</span>
                    {isAdmin && (
                      <span title={isOpt ? "Sent" : "Delivered"}>
                        {isOpt ? "✓" : "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>,
            );
          });

          // Typing indicator
          if (typing) {
            nodes.push(
              <div key="typing" className="msg-row first">
                <span className="av-box sm alt shrink-0 self-end">
                  {ini(conversation.guestName)}
                </span>
                <div className="bubble !p-0">
                  <span className="typing-bubble">
                    <i /><i /><i />
                  </span>
                </div>
              </div>,
            );
          }

          return nodes;
        })()}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Composer ── */}
      <div className="composer">
        {/* Quick-reply popover */}
        {popQR && filteredQR.length > 0 && (
          <div className="composer-pop open">
            {filteredQR.map(([title, body], i) => (
              <button
                key={title}
                type="button"
                className={`qr-item ${i === 0 ? "hl" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickQR(body)}
              >
                <b className="text-[13px] block mb-0.5">⚡ {title}</b>
                <span className="text-[13px] text-mute line-clamp-2">{body}</span>
              </button>
            ))}
          </div>
        )}

        {/* Emoji popover */}
        {popEmo && (
          <div className="composer-pop open">
            <div className="emo-grid">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => pickEmo(e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {resolved && (
          <div
            className="flex items-center justify-between gap-3 text-sm text-mute mb-3 p-3 rounded-2xl"
            style={{ background: "var(--soft)" }}
          >
            <span>This conversation is resolved. Replying will reopen it.</span>
          </div>
        )}

        {/* Mode tabs */}
        <div className="flex items-center justify-between mb-2">
          <div className="mode-tabs" role="group">
            <button
              type="button"
              aria-pressed={mode === "reply"}
              onClick={() => setMode("reply")}
            >
              Reply
            </button>
            <button
              type="button"
              aria-pressed={mode === "note"}
              onClick={() => setMode("note")}
            >
              🔒 Internal note
            </button>
          </div>
          <span className="text-[11px] text-mute hidden sm:block">
            Type <span className="kbd-hint">/</span> for quick replies · <span className="kbd-hint">Enter</span> to send
          </span>
        </div>

        {/* Composer box */}
        <div className={`cbox ${mode === "note" ? "note-mode" : ""}`}>
          <textarea
            ref={textareaRef}
            id="ta"
            rows={1}
            placeholder={
              mode === "note"
                ? "Write a note only admins can see…"
                : `Reply to ${(conversation.guestName || "").split(" ")[0]}…`
            }
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            aria-label="Message"
          />

          {/* Quick replies button */}
          <button
            type="button"
            className="tbtn"
            aria-label="Quick replies"
            onClick={() => { setPopQR(!popQR); setPopEmo(false); setQRFilter(""); }}
          >
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
            </svg>
          </button>

          {/* Emoji */}
          <button
            type="button"
            className="tbtn"
            aria-label="Emoji"
            onClick={() => { setPopEmo(!popEmo); setPopQR(false); }}
          >
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={9} />
              <path d="M8.5 14a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
            </svg>
          </button>

          {/* Send */}
          <button
            type="button"
            className="send-btn"
            aria-label="Send"
            disabled={!input.trim() || sending}
            onClick={doSend}
          >
            {sending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
