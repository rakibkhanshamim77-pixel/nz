"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications } from "./NotificationProvider";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  new_order: (
    <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 grid place-items-center shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      </svg>
    </span>
  ),
  new_contact: (
    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 grid place-items-center shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      </svg>
    </span>
  ),
};

export default function NotificationBell() {
  const { unreadCount, notifications, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const recent = notifications.slice(0, 8);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] grid place-items-center hover:bg-[var(--soft)] transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold grid place-items-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--bg)] border border-[var(--line)] rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
            <span className="font-semibold text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
                >
                  Mark all read
                </button>
              )}
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--mute)]">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--mute)]">No notifications</div>
            ) : (
              recent.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={async () => {
                    if (!n.isRead) await markRead(n._id);
                    setOpen(false);
                    router.push(n.targetUrl);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--soft)] transition-colors border-b border-[var(--line)] last:border-0 ${
                    !n.isRead ? "bg-[var(--soft)]/50" : ""
                  }`}
                >
                  {TYPE_ICONS[n.type] ?? (
                    <span className="w-8 h-8 rounded-full bg-[var(--soft)] grid place-items-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" />
                      </svg>
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold" : ""}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[var(--mute)] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-[var(--mute)] mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[var(--ink)] mt-1.5 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
