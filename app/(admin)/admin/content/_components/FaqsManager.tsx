"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqPublished,
  type FaqInput,
} from "../_actions/contentAdminActions";

export interface FaqRow {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

const EMPTY: FaqInput = {
  question: "",
  answer: "",
  category: "",
  order: 0,
  isPublished: true,
};

// ─── Form Modal ───────────────────────────────────────────────────────────────

function FaqFormModal({
  editing,
  onClose,
}: {
  editing: FaqRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<FaqInput>(
    editing
      ? {
          question: editing.question,
          answer: editing.answer,
          category: editing.category,
          order: editing.order,
          isPublished: editing.isPublished,
        }
      : EMPTY,
  );

  function set<K extends keyof FaqInput>(k: K, v: FaqInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const result = editing
        ? await updateFaq(editing._id, form)
        : await createFaq(form);
      if (!result.ok) { setErr(result.error); return; }
      router.refresh();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg)] border border-[var(--line)] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-[var(--line)]">
          <h2 className="font-display font-bold text-xl">
            {editing ? "FAQ সম্পাদনা" : "নতুন FAQ"}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <label className="field block">
            <span className="lbl">প্রশ্ন *</span>
            <input
              className="inp"
              value={form.question}
              onChange={(e) => set("question", e.target.value)}
              placeholder="ডেলিভারি কতদিনে হয়?"
              required
            />
          </label>

          <label className="field block">
            <span className="lbl">উত্তর *</span>
            <textarea
              rows={4}
              className="inp"
              style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
              value={form.answer}
              onChange={(e) => set("answer", e.target.value)}
              placeholder="ঢাকায় ১–২ কার্যদিবস…"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="field block">
              <span className="lbl">ক্যাটাগরি</span>
              <input
                className="inp"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="ডেলিভারি"
              />
            </label>
            <label className="field block">
              <span className="lbl">ক্রম</span>
              <input
                type="number"
                className="inp"
                value={form.order}
                min={0}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            </label>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <span
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isPublished ? "bg-[var(--ink)]" : "bg-[var(--line)]"
              }`}
              onClick={() => set("isPublished", !form.isPublished)}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  form.isPublished ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span className="text-sm font-medium">
              {form.isPublished ? "প্রকাশিত" : "লুকানো"}
            </span>
          </label>

          {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost" disabled={isPending}>
              বাতিল
            </button>
            <button type="submit" className="btn-solid disabled:opacity-40" disabled={isPending}>
              {isPending ? "সংরক্ষণ হচ্ছে…" : editing ? "আপডেট করুন" : "তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function FaqRowActions({
  faq,
  onEdit,
}: {
  faq: FaqRow;
  onEdit: (f: FaqRow) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      timer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    startTransition(async () => {
      await deleteFaq(faq._id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            await toggleFaqPublished(faq._id, !faq.isPublished);
            router.refresh();
          });
        }}
        disabled={isPending}
        className="btn-ghost !h-8 !px-3 !rounded-[10px] text-xs disabled:opacity-40"
      >
        {faq.isPublished ? "লুকান" : "প্রকাশ করুন"}
      </button>
      <button type="button" onClick={() => onEdit(faq)} className="icon-btn" title="সম্পাদনা">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className={`icon-btn disabled:opacity-40 ${confirmDelete ? "!bg-red-600 !text-white" : "hover:!text-red-600"}`}
        title={confirmDelete ? "নিশ্চিত করুন?" : "মুছুন"}
      >
        {confirmDelete ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="m5 12 5 5L20 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Main Manager ─────────────────────────────────────────────────────────────

export default function FaqsManager({ faqs }: { faqs: FaqRow[] }) {
  const [modal, setModal] = useState<null | "create" | FaqRow>(null);

  return (
    <>
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display font-bold text-xl">FAQs</h2>
            <p className="text-sm text-[var(--mute)] mt-0.5">
              {faqs.length} টি প্রশ্নোত্তর
            </p>
          </div>
          <button
            type="button"
            className="btn-solid inline-flex items-center gap-2"
            onClick={() => setModal("create")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            নতুন FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="py-12 text-center text-[var(--mute)]">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <p className="text-sm font-medium">কোনো FAQ নেই</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq._id} className="border border-[var(--line)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {faq.category && (
                        <span className="text-xs font-semibold text-[var(--mute)] bg-[var(--soft)] px-2 py-0.5 rounded-full">
                          {faq.category}
                        </span>
                      )}
                      {!faq.isPublished && (
                        <span className="st draft text-xs"><i />লুকানো</span>
                      )}
                    </div>
                    <p className="font-semibold text-sm leading-snug mb-1">
                      {faq.question}
                    </p>
                    <p className="text-sm text-[var(--mute)] line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                  <FaqRowActions faq={faq} onEdit={(f) => setModal(f)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <FaqFormModal
          editing={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
