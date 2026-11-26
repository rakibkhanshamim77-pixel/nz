"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateContactMessageStatus,
  markContactMessageImportant,
  deleteContactMessage,
  addContactReply,
} from "@/db/actions/admin/contact.admin.action";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import type { ContactMessageDetail as DetailType } from "@/db/actions/admin/contact.admin.action";
import type { IContactMessage } from "@/db/models/ContactMessage";

const STATUS_OPTIONS: { value: IContactMessage["status"]; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "read", label: "Read", color: "bg-gray-100 text-gray-700" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  { value: "replied", label: "Replied", color: "bg-purple-100 text-purple-800" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Closed", color: "bg-red-100 text-red-700" },
];

function timeStr(iso: string) {
  return new Date(iso).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" });
}

interface Props {
  message: DetailType;
  onClose: () => void;
}

export default function ContactMessageDetail({ message, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [replyText, setReplyText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(message.status);

  function handleStatusChange(status: IContactMessage["status"]) {
    startTransition(async () => {
      const r = await updateContactMessageStatus(message._id, status);
      if (r.ok) { setCurrentStatus(status); router.refresh(); toast.success("Status updated"); }
      else toast.error(r.error || "Failed");
    });
  }

  function handleImportant() {
    startTransition(async () => {
      await markContactMessageImportant(message._id, !message.isImportant);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    startTransition(async () => {
      await deleteContactMessage(message._id);
      router.refresh();
      onClose();
      toast.success("Message deleted");
    });
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    startTransition(async () => {
      const r = await addContactReply(message._id, replyText);
      if (r.ok) {
        setReplyText("");
        router.refresh();
        toast.success("Reply saved");
      } else {
        toast.error(r.error || "Failed");
      }
    });
  }

  const statusMeta = STATUS_OPTIONS.find((s) => s.value === currentStatus);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg)] border border-[var(--line)] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-[var(--line)] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusMeta?.color ?? ""}`}>
                {statusMeta?.label}
              </span>
              <span className="text-xs text-[var(--mute)] font-mono">{message.referenceId}</span>
              {message.isImportant && (
                <span className="text-xs text-orange-600 font-semibold">★ Important</span>
              )}
            </div>
            <h2 className="font-display font-bold text-lg leading-tight">{message.subject}</h2>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Sender info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[var(--mute)]">Name: </span><span className="font-medium">{message.name}</span></div>
            <div><span className="text-[var(--mute)]">Email: </span><a href={`mailto:${message.email}`} className="font-medium hover:underline">{message.email}</a></div>
            {message.phone && <div><span className="text-[var(--mute)]">Phone: </span><span className="font-medium">{message.phone}</span></div>}
            {message.orderId && <div><span className="text-[var(--mute)]">Order ID: </span><span className="font-mono font-medium">{message.orderId}</span></div>}
            <div><span className="text-[var(--mute)]">Category: </span><span className="font-medium capitalize">{message.category.replace(/_/g, " ")}</span></div>
            <div><span className="text-[var(--mute)]">Sent: </span><span className="font-medium">{timeStr(message.createdAt)}</span></div>
          </div>

          {/* Message */}
          <div className="bg-[var(--soft)] rounded-2xl p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="inp !h-9 !py-0 !w-auto text-sm"
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as IContactMessage["status"])}
              disabled={isPending}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button type="button" onClick={handleImportant} disabled={isPending} className="btn-ghost !h-9 !px-3 !text-xs">
              {message.isImportant ? "Remove Important" : "Mark Important"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className={`btn-ghost !h-9 !px-3 !text-xs ml-auto ${confirmDelete ? "!text-red-600 !border-red-400" : ""}`}
            >
              {confirmDelete ? "Confirm Delete?" : "Delete"}
            </button>
          </div>

          {/* Reply history */}
          {message.replies.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--mute)] uppercase tracking-wide">Replies</p>
              {message.replies.map((r) => (
                <div key={r._id} className="border border-[var(--line)] rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold">{r.adminName}</span>
                    <span className="text-xs text-[var(--mute)]">{timeStr(r.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <form onSubmit={handleReply} className="space-y-3">
            <p className="text-xs font-semibold text-[var(--mute)] uppercase tracking-wide">Add Internal Note / Reply</p>
            <textarea
              rows={3}
              className="inp"
              style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a note or reply…"
              disabled={isPending}
            />
            <button
              type="submit"
              className="btn-solid disabled:opacity-40 !h-9 !px-4 !text-sm"
              disabled={isPending || !replyText.trim()}
            >
              {isPending ? "Saving…" : "Save Note"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
