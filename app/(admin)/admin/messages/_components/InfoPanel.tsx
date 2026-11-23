"use client";

import type { ConversationRow } from "@/lib/socket.types";

interface Props {
  conversation: ConversationRow | null;
  messageCount: number;
  onClose?: () => void;
  onStatusChange?: (status: "open" | "pending" | "closed") => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onDeleteMessages?: () => void;
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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusColor(s: string) {
  return s === "open" ? "#22c55e" : s === "pending" ? "#f59e0b" : "var(--mute)";
}

export default function InfoPanel({
  conversation,
  messageCount,
  onClose,
  onStatusChange,
  onBlock,
  onUnblock,
  onDeleteMessages,
}: Props) {
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-center">
        <p className="text-sm text-mute">Select a conversation to see customer details.</p>
      </div>
    );
  }

  const c = conversation;
  const statusLabel =
    c.status === "open" ? "Open" : c.status === "pending" ? "Waiting" : "Resolved";
  const nextStatus: "open" | "pending" | "closed" =
    c.status === "closed" ? "open" : "closed";

  return (
    <>
      {/* Profile section */}
      <div className="info-sec text-center pt-7 relative">
        {onClose && (
          <button
            type="button"
            className="icon-btn absolute right-4 top-4 xl:hidden"
            aria-label="Close"
            onClick={onClose}
          >
            <svg fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" className="w-[17px] h-[17px]">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}

        <span
          className="av-box lg mx-auto mb-3"
          style={{ display: "grid", placeItems: "center" }}
        >
          {ini(c.guestName)}
          <span
            className="av-dot"
            style={{
              background: c.isBlocked ? "#ef4444" : statusColor(c.status),
              width: 16,
              height: 16,
            }}
          />
        </span>

        <b className="font-display text-lg block">{c.guestName}</b>
        {c.guestEmail && <span className="text-sm text-mute">{c.guestEmail}</span>}

        {c.isBlocked && (
          <span
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Blocked
          </span>
        )}

        {/* Quick actions */}
        <div className="flex gap-2 mt-4 justify-center flex-wrap">
          {c.guestEmail && (
            <a href={`mailto:${c.guestEmail}`} className="btn-ghost !h-10 !px-4 text-[13px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x={3} y={5} width={18} height={14} rx={2} />
                <path d="m3 7 9 6 9-6" />
              </svg>
              Email
            </a>
          )}
          <button
            type="button"
            className="btn-ghost !h-10 !px-4 text-[13px]"
            onClick={() => onStatusChange?.(nextStatus)}
          >
            {c.status === "closed" ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
                Reopen
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="m5 12 5 5L20 7" />
                </svg>
                Resolve
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conversation details */}
      <div className="info-sec">
        <h4>Conversation</h4>
        <dl>
          <div className="kv-row">
            <dt>Status</dt>
            <dd>
              <span
                className="inline-flex items-center gap-1.5 font-semibold"
                style={{ color: c.isBlocked ? "#ef4444" : statusColor(c.status) }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: c.isBlocked ? "#ef4444" : statusColor(c.status) }}
                />
                {c.isBlocked ? "Blocked" : statusLabel}
              </span>
            </dd>
          </div>
          <div className="kv-row">
            <dt>Started</dt>
            <dd>
              {new Date(c.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
          <div className="kv-row">
            <dt>Last message</dt>
            <dd>{rel(c.lastMessageAt)}</dd>
          </div>
          <div className="kv-row">
            <dt>Total messages</dt>
            <dd>{messageCount}</dd>
          </div>
          <div className="kv-row">
            <dt>Unread (admin)</dt>
            <dd>{c.unreadByAdmin}</dd>
          </div>
          <div className="kv-row">
            <dt>Unread (customer)</dt>
            <dd>{c.unreadByCustomer}</dd>
          </div>
        </dl>
      </div>

      {/* Change status manually */}
      {onStatusChange && (
        <div className="info-sec">
          <h4>Change Status</h4>
          <div className="flex flex-wrap gap-2">
            {(["open", "pending", "closed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="filter-chip"
                aria-pressed={c.status === s}
                onClick={() => onStatusChange(s)}
                style={
                  c.status === s
                    ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" }
                    : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full mr-1.5 inline-block"
                  style={{ background: statusColor(s) }}
                />
                {s === "pending" ? "Waiting" : s === "closed" ? "Resolved" : "Open"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Technical info */}
      <div className="info-sec">
        <h4>Technical Info</h4>
        <dl>
          <div className="kv-row">
            <dt>Guest ID</dt>
            <dd className="mono text-xs opacity-70 break-all">{c.guestId}</dd>
          </div>
          <div className="kv-row">
            <dt>Conv ID</dt>
            <dd className="mono text-xs opacity-70 break-all">{c._id}</dd>
          </div>
        </dl>
      </div>

      {/* Last message preview */}
      <div className="info-sec">
        <h4>Preview</h4>
        <div
          className="mt-2 p-3 rounded-xl text-sm"
          style={{ background: "var(--soft)", border: "1px solid var(--line)" }}
        >
          {c.lastMessage || <span className="text-mute italic">No messages yet</span>}
        </div>
      </div>

      {/* Danger zone */}
      <div className="info-sec">
        <h4 style={{ color: "#ef4444" }}>Danger Zone</h4>
        <div className="flex flex-col gap-2">
          {/* Delete all messages */}
          {onDeleteMessages && (
            <button
              type="button"
              className="btn-ghost !h-10 !px-4 text-[13px] w-full justify-start"
              style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
              onClick={onDeleteMessages}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              Delete all messages
            </button>
          )}

          {/* Block / Unblock */}
          {c.isBlocked ? (
            onUnblock && (
              <button
                type="button"
                className="btn-ghost !h-10 !px-4 text-[13px] w-full justify-start"
                style={{ color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" }}
                onClick={onUnblock}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx={12} cy={12} r={9} />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Unblock customer
              </button>
            )
          ) : (
            onBlock && (
              <button
                type="button"
                className="btn-ghost !h-10 !px-4 text-[13px] w-full justify-start"
                style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                onClick={onBlock}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx={12} cy={12} r={9} />
                  <path d="M4.93 4.93l14.14 14.14" />
                </svg>
                Block customer
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}
