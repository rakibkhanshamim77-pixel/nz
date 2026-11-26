"use client";

import { useState, useTransition, useRef } from "react";
import { replyToReview, removeReply } from "../_actions/reviewActions";

interface Props {
  reviewId: string;
  existingReply: string | null;
  repliedAt: string | null;
}

export default function ReviewReplyPanel({ reviewId, existingReply, repliedAt }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(existingReply ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleOpen() {
    setOpen(true);
    setSuccess(false);
    setErr(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const res = await replyToReview(reviewId, text);
      if (res.ok) {
        setSuccess(true);
        setOpen(false);
      } else {
        setErr(res.error ?? "Error saving reply");
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeReply(reviewId);
      setText("");
      setOpen(false);
      setSuccess(false);
    });
  }

  return (
    <div className="mt-2">
      {/* Trigger */}
      {!open && (
        <button
          type="button"
          onClick={handleOpen}
          className="btn-ghost !h-8 !px-3 !rounded-[10px] text-xs inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {existingReply ? "Edit reply" : "Reply"}
        </button>
      )}

      {/* Existing reply info */}
      {existingReply && !open && (
        <div className="mt-2 p-3 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-sm">
          <p className="text-xs text-[var(--mute)] font-semibold mb-1 uppercase tracking-wider">
            Store reply
            {repliedAt && (
              <span className="ml-2 normal-case font-normal">
                · {new Date(repliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
          </p>
          <p className="text-[var(--ink)] leading-relaxed">{existingReply}</p>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="mt-2 text-xs text-[var(--mute)] hover:text-[var(--ink)] transition-colors disabled:opacity-40"
          >
            Remove reply
          </button>
        </div>
      )}

      {/* Inline form */}
      {open && (
        <form onSubmit={handleSubmit} className="mt-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Write a reply visible to customers…"
            className="inp !h-auto py-3 text-sm resize-none w-full"
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-xs text-[var(--mute)]">
              {text.length}/500
            </span>
            <div className="flex items-center gap-2">
              {err && <span className="text-xs text-red-600">{err}</span>}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost !h-8 !px-3 !rounded-[10px] text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !text.trim()}
                className="btn-solid !h-8 !px-3 !rounded-[10px] text-xs disabled:opacity-40"
              >
                {isPending ? "Saving…" : "Save reply"}
              </button>
            </div>
          </div>
          {success && (
            <p className="text-xs text-green-600 mt-1">Reply saved!</p>
          )}
        </form>
      )}
    </div>
  );
}
