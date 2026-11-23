"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { setCategoryActive } from "@/db/actions/admin/category.admin.action";
import CategoriesTable from "./CategoriesTable";
import CategoryFormDialog from "./CategoryFormDialog";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import type { CategoryChoice, CategoryRow } from "./types";

interface Props {
  rows: CategoryRow[];
  choices: CategoryChoice[];
  total: number;
  matched: number;
  nextOrder: number;
}

const STATUS = [
  { key: "", label: "All" },
  { key: "visible", label: "Visible" },
  { key: "hidden", label: "Hidden" },
] as const;

export default function CategoriesManager({ rows, choices, total, matched, nextOrder }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const push = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(updates).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      next.delete("page");
      const qs = next.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
    },
    [params, pathname, router],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: CategoryRow) => {
    setEditing(c);
    setFormOpen(true);
  };
  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  async function toggleActive(c: CategoryRow) {
    setTogglingId(c.id);
    try {
      const res = await setCategoryActive(c.id, !c.isActive);
      if (!res.ok) return toast.error(res.error);
      toast.success(c.isActive ? `${c.name} is now hidden` : `${c.name} is now visible`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't update the category. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  const status = params.get("status") ?? "";
  const filtered = !!(params.get("q") || status);

  return (
    <>
      <section className="card p-4 sm:p-5 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="block flex-1">
            <span className="flbl">Search</span>
            <span className="relative block">
              <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mute)] pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx={11} cy={11} r={7} />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                className="inp !h-11 !pl-11 text-sm"
                placeholder="Name, slug, tag or filter value"
                autoComplete="off"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  if (timer.current) clearTimeout(timer.current);
                  timer.current = setTimeout(() => push({ q: v.trim() }), 250);
                }}
              />
            </span>
          </label>
          <button type="button" className="btn-solid !h-11 justify-center" onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            New Category
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--line)]">
          <div className="flex gap-2" role="group" aria-label="Visibility filter">
            {STATUS.map((s) => (
              <button key={s.key} type="button" className="chip" aria-pressed={status === s.key} onClick={() => push({ status: s.key })}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-[var(--mute)] flex items-center gap-2">
            {pending && <span className="spin !w-3.5 !h-3.5" aria-hidden="true" />}
            <b className="text-[var(--ink)]">{matched}</b> of <b className="text-[var(--ink)]">{total}</b> categories
          </p>
        </div>
      </section>

      {rows.length > 0 ? (
        <CategoriesTable rows={rows} togglingId={togglingId} onEdit={openEdit} onDelete={setDeleting} onToggleActive={toggleActive} />
      ) : (
        <section className="card p-10 sm:p-14 text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--soft)] grid place-items-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <rect x={3} y={3} width={8} height={8} rx={1} /><rect x={13} y={3} width={8} height={8} rx={1} />
              <rect x={3} y={13} width={8} height={8} rx={1} /><rect x={13} y={13} width={8} height={8} rx={1} />
            </svg>
          </div>
          <b className="font-display text-lg block">{filtered ? "No categories match" : "No categories yet"}</b>
          <p className="text-sm text-[var(--mute)] mt-1">
            {filtered ? "Try a different search or filter." : "Create your first category to organise products and the shop."}
          </p>
          {!filtered && (
            <button type="button" className="btn-solid mt-5 inline-flex" onClick={openCreate}>
              Create a category
            </button>
          )}
        </section>
      )}

      <CategoryFormDialog open={formOpen} category={editing} nextOrder={nextOrder} onClose={closeForm} />
      <DeleteCategoryDialog category={deleting} choices={choices} onClose={closeDelete} />
    </>
  );
}
