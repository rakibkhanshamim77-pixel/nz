"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { deleteCategory } from "@/db/actions/admin/category.admin.action";
import type { CategoryChoice, CategoryRow } from "./types";

interface Props {
  category: CategoryRow | null;
  choices: CategoryChoice[];
  onClose: () => void;
}

export default function DeleteCategoryDialog({ category, choices, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const open = !!category;
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setTarget("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  const others = choices.filter((c) => c.filter !== category?.filter);
  const inUse = category?.productCount ?? 0;
  const blocked = inUse > 0 && (!target || others.length === 0);

  async function confirm() {
    if (!category || blocked) return;
    setLoading(true);
    try {
      const res = await deleteCategory(category.id, inUse > 0 ? target : undefined);
      if (!res.ok) return toast.error(res.error);
      toast.success(
        res.data.moved
          ? `Category deleted · ${res.data.moved} product${res.data.moved > 1 ? "s" : ""} moved`
          : "Category deleted",
      );
      onClose();
      router.refresh();
    } catch {
      toast.error("Couldn't delete the category. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`dlg fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4 ${open ? "show" : ""}`}
      aria-hidden={!open}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="dlg-box w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-3xl bg-[var(--bg)] border border-[var(--line)] p-6 sm:p-7 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-cat-title"
      >
        <div className="w-14 h-14 rounded-2xl bg-[var(--ink)] text-[var(--bg)] grid place-items-center mb-5">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </div>
        <h2 id="del-cat-title" className="font-display font-extrabold text-2xl tracking-tight mb-2">
          Delete this category?
        </h2>
        <p className="text-[15px] text-[var(--mute)] leading-relaxed">
          <b className="text-[var(--ink)]">{category?.name}</b> will be removed from the home page and shop filters.
          This can&apos;t be undone.
        </p>

        {inUse > 0 && (
          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4">
            <p className="text-sm font-semibold">
              {inUse} product{inUse > 1 ? "s are" : " is"} in this category.
            </p>
            {others.length ? (
              <label className="block mt-3">
                <span className="flbl">Move {inUse > 1 ? "them" : "it"} to</span>
                <span className="sel-wrap block">
                  <select className="inp !h-11 text-sm !bg-[var(--surface)]" value={target} onChange={(e) => setTarget(e.target.value)}>
                    <option value="">Choose a category</option>
                    {others.map((c) => (
                      <option key={c.filter} value={c.filter}>
                        {c.name} ({c.filter})
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            ) : (
              <p className="text-sm text-[var(--mute)] mt-1">
                Create another category first so these products have somewhere to go.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} disabled={loading} className="btn-ghost flex-1 justify-center">
            Cancel
          </button>
          <button type="button" disabled={blocked || loading} onClick={confirm} className="btn-solid flex-1 justify-center">
            {loading ? <span className="spin" /> : inUse > 0 ? "Move & delete" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
