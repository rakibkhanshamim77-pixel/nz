"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { markContactMessageRead } from "@/db/actions/admin/contact.admin.action";
import ContactMessageDetail from "./ContactMessageDetail";
import type {
  ContactMessageRow,
  ContactMessageDetail as DetailType,
} from "@/db/actions/admin/contact.admin.action";

const STATUSES = ["all", "new", "read", "in_progress", "replied", "resolved", "closed"];
const CATEGORIES = ["all", "general", "order", "product", "delivery", "return_exchange", "payment", "complaint", "other"];

function statusBadge(s: string) {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    read: "bg-gray-100 text-gray-700",
    in_progress: "bg-yellow-100 text-yellow-800",
    replied: "bg-purple-100 text-purple-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-red-100 text-red-700",
  };
  return map[s] ?? "bg-gray-100 text-gray-700";
}

function timeStr(iso: string) {
  return new Date(iso).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  initialMessages: ContactMessageRow[];
  total: number;
  page: number;
}

export default function ContactInbox({ initialMessages, total, page }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [isRead, setIsRead] = useState(searchParams.get("isRead") || "all");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailType | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const totalPages = Math.ceil(total / 20);

  function pushParams(overrides: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v && v !== "all") p.set(k, v);
      else p.delete(k);
    });
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }

  function goPage(n: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(n));
    router.push(`${pathname}?${p.toString()}`);
  }

  const openMessage = useCallback(async (msg: ContactMessageRow) => {
    setLoadingDetail(true);
    setSelected(msg._id);
    if (!msg.isRead) {
      await markContactMessageRead(msg._id);
      router.refresh();
    }
    try {
      const res = await fetch(`/api/admin/contact/${msg._id}`);
      if (res.ok) setDetail(await res.json());
    } catch {}
    setLoadingDetail(false);
  }, [router]);

  return (
    <>
      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            className="inp !h-9 flex-1 min-w-48 text-sm"
            placeholder="Search name, email, ref ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && pushParams({ search })}
          />
          <select className="inp !h-9 !w-auto text-sm" value={status} onChange={(e) => { setStatus(e.target.value); startTransition(() => pushParams({ status: e.target.value, search })); }}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All Status" : s.replace(/_/g, " ")}</option>)}
          </select>
          <select className="inp !h-9 !w-auto text-sm" value={category} onChange={(e) => { setCategory(e.target.value); startTransition(() => pushParams({ category: e.target.value, search })); }}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === "all" ? "All Categories" : c.replace(/_/g, " ")}</option>)}
          </select>
          <select className="inp !h-9 !w-auto text-sm" value={isRead} onChange={(e) => { setIsRead(e.target.value); startTransition(() => pushParams({ isRead: e.target.value, search })); }}>
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button type="button" className="btn-solid !h-9 !px-4 !text-sm disabled:opacity-40" disabled={isPending} onClick={() => pushParams({ search })}>
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {initialMessages.length === 0 ? (
          <div className="py-16 text-center text-[var(--mute)]">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
            </svg>
            <p className="text-sm font-medium">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--mute)] uppercase tracking-wide">From</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--mute)] uppercase tracking-wide">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--mute)] uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--mute)] uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {initialMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    onClick={() => openMessage(msg)}
                    className={`border-b border-[var(--line)] hover:bg-[var(--soft)] cursor-pointer transition-colors ${selected === msg._id ? "bg-[var(--soft)]" : ""} ${!msg.isRead ? "font-semibold" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className={`${!msg.isRead ? "font-bold" : ""}`}>{msg.name}</p>
                      <p className="text-xs text-[var(--mute)]">{msg.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-1">{msg.subject}</p>
                      <p className="text-xs text-[var(--mute)] capitalize">{msg.category.replace(/_/g, " ")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(msg.status)}`}>
                        {msg.status.replace(/_/g, " ")}
                      </span>
                      {msg.isImportant && <span className="text-orange-500 ml-1">★</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--mute)]">{timeStr(msg.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-[var(--line)]">
            <button type="button" className="btn-ghost !h-8 !px-3 !text-xs" disabled={page <= 1} onClick={() => goPage(page - 1)}>
              Previous
            </button>
            <span className="text-sm text-[var(--mute)]">Page {page} of {totalPages}</span>
            <button type="button" className="btn-ghost !h-8 !px-3 !text-xs" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-[var(--bg)] rounded-2xl p-8 text-sm text-[var(--mute)]">Loading…</div>
        </div>
      )}
      {detail && !loadingDetail && (
        <ContactMessageDetail
          message={detail}
          onClose={() => { setDetail(null); setSelected(null); }}
        />
      )}
    </>
  );
}
