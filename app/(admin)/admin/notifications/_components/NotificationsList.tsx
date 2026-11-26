"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/app/(admin)/_components/NotificationProvider";
import type { NotificationRow } from "@/db/actions/admin/notification.action";
import PushNotificationSetup from "@/app/(admin)/_components/PushNotificationSetup";

function timeStr(iso: string) {
  return new Date(iso).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" });
}

const TYPE_LABEL: Record<string, string> = {
  new_order: "New Order",
  new_contact: "Contact Message",
  order_status: "Order Update",
  system: "System",
};

const TYPE_COLOR: Record<string, string> = {
  new_order: "bg-green-100 text-green-800",
  new_contact: "bg-blue-100 text-blue-800",
  order_status: "bg-yellow-100 text-yellow-800",
  system: "bg-gray-100 text-gray-700",
};

interface Props {
  initialNotifications: NotificationRow[];
  total: number;
  page: number;
}

export default function NotificationsList({ initialNotifications, total, page }: Props) {
  const router = useRouter();
  const { markRead, markAllRead, remove } = useNotifications();
  const [items, setItems] = useState<NotificationRow[]>(initialNotifications);
  const totalPages = Math.ceil(total / 20);

  const handleClick = useCallback(async (n: NotificationRow) => {
    if (!n.isRead) {
      await markRead(n._id);
      setItems((prev) => prev.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
    }
    router.push(n.targetUrl);
  }, [markRead, router]);

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await remove(id);
    setItems((prev) => prev.filter((n) => n._id !== id));
    router.refresh();
  }, [remove, router]);

  return (
    <div className="space-y-4">
      <PushNotificationSetup />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--mute)]">{total} notification{total !== 1 ? "s" : ""}</p>
        {items.some((n) => !n.isRead) && (
          <button
            type="button"
            className="btn-ghost !h-8 !px-3 !text-xs"
            onClick={async () => {
              await markAllRead();
              setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card py-16 text-center text-[var(--mute)]">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" />
          </svg>
          <p className="text-sm font-medium">No notifications</p>
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-[var(--line)]">
          {items.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--soft)] transition-colors ${!n.isRead ? "bg-[var(--soft)]/50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[n.type] ?? "bg-gray-100 text-gray-700"}`}>
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[var(--ink)] inline-block" />}
                </div>
                <p className={`text-sm ${!n.isRead ? "font-semibold" : ""}`}>{n.title}</p>
                <p className="text-xs text-[var(--mute)] mt-0.5 line-clamp-1">{n.message}</p>
                <p className="text-xs text-[var(--mute)] mt-1">{timeStr(n.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(n._id, e)}
                className="icon-btn !w-8 !h-8 shrink-0 hover:!text-red-600"
                aria-label="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="btn-ghost !h-8 !px-3 !text-xs" disabled={page <= 1} onClick={() => router.push(`/admin/notifications?page=${page - 1}`)}>
            Previous
          </button>
          <span className="text-sm text-[var(--mute)]">Page {page} of {totalPages}</span>
          <button type="button" className="btn-ghost !h-8 !px-3 !text-xs" disabled={page >= totalPages} onClick={() => router.push(`/admin/notifications?page=${page + 1}`)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
