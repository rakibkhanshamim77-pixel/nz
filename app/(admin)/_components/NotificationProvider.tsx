"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { NotificationRow } from "@/db/actions/admin/notification.action";

interface NotificationContextValue {
  unreadCount: number;
  notifications: NotificationRow[];
  loading: boolean;
  refresh: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?page=1");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unread ?? 0);
      }
    } catch {}
    setLoading(false);
  }, []);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource("/api/admin/notifications/sse");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.unread === "number") {
          setUnreadCount((prev) => {
            if (data.unread !== prev) {
              fetchNotifications();
            }
            return data.unread;
          });
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(connectSSE, 5000);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    connectSSE();
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [fetchNotifications, connectSSE]);

  const markRead = useCallback(async (id: string) => {
    await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/admin/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const remove = useCallback(async (id: string) => {
    const n = notifications.find((n) => n._id === id);
    await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (n && !n.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [notifications]);

  const value = useMemo(
    () => ({ unreadCount, notifications, loading, refresh: fetchNotifications, markRead, markAllRead, remove }),
    [unreadCount, notifications, loading, fetchNotifications, markRead, markAllRead, remove],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
