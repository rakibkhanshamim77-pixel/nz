"use client";

import type { ConversationRow } from "@/lib/socket.types";

export type TabKey = "all" | "unread" | "open" | "pending" | "closed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "unread",  label: "Unread" },
  { key: "open",    label: "Open" },
  { key: "pending", label: "Waiting" },
  { key: "closed",  label: "Resolved" },
];

interface Props {
  conversations: ConversationRow[];
  activeId: string | null;
  filter: TabKey;
  search: string;
  totalUnread: number;
  connected: boolean;
  onSelect: (id: string) => void;
  onFilterChange: (f: TabKey) => void;
  onSearchChange: (q: string) => void;
  onMarkAllRead: () => void;
  onSimulate?: () => void;
}

function ini(name: string) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function rel(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function tabCount(conversations: ConversationRow[], key: TabKey) {
  if (key === "all") return conversations.length;
  if (key === "unread") return conversations.filter((c) => c.unreadByAdmin > 0).length;
  return conversations.filter((c) => c.status === key).length;
}

export default function ConvList({
  conversations,
  activeId,
  filter,
  search,
  totalUnread,
  connected,
  onSelect,
  onFilterChange,
  onSearchChange,
  onMarkAllRead,
  onSimulate,
}: Props) {
  const filtered = conversations
    .filter((c) => {
      if (filter === "unread") return c.unreadByAdmin > 0;
      if (filter !== "all") return c.status === filter;
      return true;
    })
    .filter(
      (c) =>
        !search ||
        (c.guestName || "").toLowerCase().includes(search) ||
        (c.guestEmail || "").toLowerCase().includes(search) ||
        (c.lastMessage || "").toLowerCase().includes(search),
    )
    .sort((a, b) => (b.unreadByAdmin > 0 ? 1 : 0) - (a.unreadByAdmin > 0 ? 1 : 0) ||
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return (
    <div className="inbox-pane inbox-list list-pane">
      {/* Sidebar header */}
      <div className="p-4 pb-3 border-b border-line">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-extrabold text-lg tracking-tight">Live chat</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: connected ? "#22c55e" : "var(--mute)" }}
              />
              {connected ? "Live" : "Offline"}
            </span>
          </div>
          {totalUnread > 0 && (
            <span className="ubadge">{totalUnread > 99 ? "99+" : totalUnread}</span>
          )}
        </div>

        {/* Search */}
        <label className="relative block">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <circle cx={11} cy={11} r={7} />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value.toLowerCase())}
            className="inp !h-11 !pl-10 !pr-10 text-sm w-full"
            placeholder="Search conversations"
            autoComplete="off"
          />
          <span className="kbd-hint absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">/</span>
        </label>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3" role="group">
          {TABS.map(({ key, label }) => {
            const n = tabCount(conversations, key);
            return (
              <button
                key={key}
                type="button"
                className="filter-chip"
                aria-pressed={filter === key}
                onClick={() => onFilterChange(key)}
              >
                {label}
                {n > 0 && <span className="ml-1 opacity-60">({n})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center"
              style={{ background: "var(--soft)" }}
            >
              <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">No conversations</p>
              <p className="text-xs text-mute mt-1">Nothing matches this filter.</p>
            </div>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv._id === activeId;
            const statusClass =
              conv.status === "open" ? "online" : conv.status === "pending" ? "pending-s" : "closed-s";

            return (
              <button
                key={conv._id}
                type="button"
                className={`conv-row ${isActive ? "active" : ""} w-full`}
                onClick={() => onSelect(conv._id)}
              >
                {/* Avatar */}
                <span className="av-box alt">
                  {ini(conv.guestName)}
                  <span className={`av-dot ${statusClass}`} />
                </span>

                <span className="min-w-0 flex-1">
                  {/* Name + time */}
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className="text-[14.5px] font-semibold truncate"
                      style={{ color: "var(--ink)", fontWeight: conv.unreadByAdmin > 0 ? 700 : 600 }}
                    >
                      {conv.guestName}
                    </span>
                    <span className="text-[11px] text-mute shrink-0">{rel(conv.lastMessageAt)}</span>
                  </span>

                  {/* Last message + badge */}
                  <span className="flex items-center justify-between gap-2 mt-0.5">
                    <span
                      className="text-[13px] text-mute truncate"
                      style={{ fontWeight: conv.unreadByAdmin > 0 ? 700 : 400, color: conv.unreadByAdmin > 0 ? "var(--ink)" : undefined }}
                    >
                      {conv.lastMessage || "Conversation started"}
                    </span>
                    {conv.unreadByAdmin > 0 && (
                      <span className="ubadge">
                        {conv.unreadByAdmin > 9 ? "9+" : conv.unreadByAdmin}
                      </span>
                    )}
                  </span>

                  {/* Status */}
                  <span className="flex items-center gap-1.5 mt-2">
                    <span
                      className="sdot-s"
                      style={{
                        background:
                          conv.status === "open" ? "#22c55e" :
                          conv.status === "pending" ? "#f59e0b" : "var(--mute)",
                      }}
                    />
                    <span className="text-[11px] font-semibold text-mute capitalize">
                      {conv.status === "pending" ? "waiting" : conv.status}
                    </span>
                    {conv.guestEmail && (
                      <span className="text-[11px] text-mute ml-auto truncate max-w-[100px]">
                        {conv.guestEmail}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Sidebar footer */}
      <div className="p-3 border-t border-line flex items-center justify-between gap-2">
        {onSimulate && (
          <button
            type="button"
            className="btn-ghost !h-10 !px-3 text-xs"
            onClick={onSimulate}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Simulate incoming
          </button>
        )}
        <button
          type="button"
          className="btn-ghost !h-10 !px-3 text-xs ml-auto"
          onClick={onMarkAllRead}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m2 13 4 4L14 7M10 15l2 2L22 7" />
          </svg>
          Mark all read
        </button>
      </div>
    </div>
  );
}
