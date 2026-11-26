"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { createCategory, updateCategory } from "@/db/actions/admin/category.admin.action";
import { slugify } from "@/db/utils/slug";
import {
  CATEGORY_LIMITS,
  HEX_COLOR,
  validateCategory,
  type CategoryFieldErrors,
  type CategoryPayload,
} from "@/db/validation/category.validation";
import CategoryCardPreview from "./CategoryCardPreview";
import type { CategoryRow } from "./types";

interface Props {
  open: boolean;
  category: CategoryRow | null;
  nextOrder: number;
  onClose: () => void;
}

const blank = (order: number): CategoryPayload => ({
  name: "", slug: "", label: "", filter: "", description: "", startingPrice: "",
  bgColor: "#1f2937", accentColor: "#cbd5e1", order: String(order), isActive: true, isFeatured: false,
});

const fromRow = (c: CategoryRow): CategoryPayload => ({
  name: c.name, slug: c.slug, label: c.label, filter: c.filter, description: c.description,
  startingPrice: c.startingPrice ? String(c.startingPrice) : "", bgColor: c.bgColor, accentColor: c.accentColor,
  order: String(c.order), isActive: c.isActive, isFeatured: c.isFeatured,
});

const autoFilter = (label: string, name: string) =>
  (label.trim() || name).replace(/[^A-Za-z0-9 &'-]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);

function Err({ msg }: { msg?: string }) {
  return (
    <span className="hint">
      <span className="ferr" role={msg ? "alert" : undefined}>{msg ?? ""}</span>
    </span>
  );
}

function ColorField({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="flbl">{label}</span>
      <span className="flex gap-2">
        <span className="picker !w-11 !h-11 shrink-0" title={`Pick ${label.toLowerCase()}`}>
          <input type="color" value={HEX_COLOR.test(value) && value.length === 7 ? value : "#000000"} onChange={(e) => onChange(e.target.value)} aria-label={`${label} picker`} />
          <span style={{ background: HEX_COLOR.test(value) ? value : "transparent" }} />
        </span>
        <input
          className={`inp !h-11 text-sm mono ${error ? "err" : ""}`}
          value={value}
          maxLength={7}
          onChange={(e) => {
            let v = e.target.value.replace(/[^#0-9a-fA-F]/g, "");
            if (v && v[0] !== "#") v = "#" + v;
            onChange(v);
          }}
        />
      </span>
      <Err msg={error} />
    </label>
  );
}

export default function CategoryFormDialog({ open, category, nextOrder, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const editing = !!category;
  const [values, setValues] = useState<CategoryPayload>(() => blank(nextOrder));
  const [errors, setErrors] = useState<CategoryFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [filterTouched, setFilterTouched] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(category ? fromRow(category) : blank(nextOrder));
    setErrors({});
    setSlugTouched(!!category);
    setFilterTouched(!!category);
    const t = setTimeout(() => nameInput.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open, category, nextOrder]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  function set(patch: Partial<CategoryPayload>) {
    setValues((v) => {
      const next = { ...v, ...patch };
      if (!slugTouched && ("name" in patch || "label" in patch)) next.slug = slugify(next.name) || slugify(next.label);
      if (!filterTouched && ("name" in patch || "label" in patch)) next.filter = autoFilter(next.label, next.name);
      return next;
    });
    setErrors((e) => {
      const next = { ...e };
      (Object.keys(patch) as (keyof CategoryPayload)[]).forEach((k) => delete next[k]);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const check = validateCategory(values);
    if (!check.ok) {
      setErrors(check.errors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    try {
      const res = category ? await updateCategory(category.id, values) : await createCategory(values);
      if (!res.ok) {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        toast.error(res.error);
        return;
      }
      toast.success(editing ? "Category updated" : `“${check.data.name}” was created`);
      onClose();
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const filterChanged = !!category && values.filter.trim() !== category.filter;
  const L = CATEGORY_LIMITS;
  const lowest = category?.lowestLivePrice ?? null;

  return (
    <div
      className={`dlg fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4 ${open ? "show" : ""}`}
      aria-hidden={!open}
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <form
        noValidate
        onSubmit={submit}
        className="dlg-box w-full sm:max-w-[820px] max-h-[94dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[var(--bg)] border border-[var(--line)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cat-dlg-title"
      >
        <div className="sticky top-0 z-10 bg-[var(--bg)] px-6 sm:px-7 pt-6 pb-4 border-b border-[var(--line)] flex items-start justify-between gap-4">
          <div>
            <h2 id="cat-dlg-title" className="font-display font-extrabold text-2xl tracking-tight">
              {editing ? "Edit category" : "New category"}
            </h2>
            <p className="text-sm text-[var(--mute)] mt-1">Shown on the home page and used to filter the shop.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="w-10 h-10 rounded-full border border-[var(--line)] grid place-items-center hover:bg-[var(--soft)] shrink-0" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <fieldset disabled={saving} className="grid md:grid-cols-[minmax(0,1fr)_240px] gap-6 px-6 sm:px-7 py-6 border-0 m-0 min-w-0">
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 content-start">
            <label className="block sm:col-span-2">
              <span className="flbl">Name * <span className="font-medium">(shown to customers, Bangla is fine)</span></span>
              <input ref={nameInput} className={`inp !h-11 text-sm ${errors.name ? "err" : ""}`} maxLength={L.nameMax} placeholder="e.g. বেসিক টি-শার্ট" value={values.name} onChange={(e) => set({ name: e.target.value })} />
              <Err msg={errors.name} />
            </label>

            <label className="block">
              <span className="flbl">Tag label</span>
              <input className={`inp !h-11 text-sm ${errors.label ? "err" : ""}`} maxLength={L.labelMax} placeholder="e.g. Basic" value={values.label} onChange={(e) => set({ label: e.target.value })} />
              <Err msg={errors.label} />
            </label>

            <label className="block">
              <span className="flbl">Slug *</span>
              <input
                className={`inp !h-11 text-sm ${errors.slug ? "err" : ""}`}
                maxLength={L.slugMax}
                placeholder="basic-tshirt"
                spellCheck={false}
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-") });
                }}
              />
              <Err msg={errors.slug ?? (!values.slug && values.name && !slugTouched ? "Add an English tag or type a slug" : undefined)} />
            </label>

            <label className="block sm:col-span-2">
              <span className="flbl">Filter value * <span className="font-medium">(stored on products; the shop filters by it)</span></span>
              <input
                className={`inp !h-11 text-sm ${errors.filter ? "err" : ""}`}
                maxLength={40}
                placeholder="e.g. Basic"
                value={values.filter}
                onChange={(e) => {
                  setFilterTouched(true);
                  set({ filter: e.target.value });
                }}
              />
              <span className="hint">
                <span className="ferr">{errors.filter ?? ""}</span>
                {!errors.filter && filterChanged && category && category.productCount > 0 && (
                  <span>{category.productCount} product{category.productCount > 1 ? "s" : ""} will move to “{values.filter.trim()}”.</span>
                )}
              </span>
            </label>

            <label className="block sm:col-span-2">
              <span className="flbl">Description</span>
              <textarea className={`inp text-sm !min-h-[84px] ${errors.description ? "err" : ""}`} maxLength={L.descriptionMax} value={values.description} onChange={(e) => set({ description: e.target.value })} />
              <span className="hint">
                <span className="ferr">{errors.description ?? ""}</span>
                <span className="ml-auto">{values.description.length} / {L.descriptionMax}</span>
              </span>
            </label>

            <ColorField label="Card colour" value={values.bgColor} error={errors.bgColor} onChange={(bgColor) => set({ bgColor })} />
            <ColorField label="Accent colour" value={values.accentColor} error={errors.accentColor} onChange={(accentColor) => set({ accentColor })} />

            <label className="block">
              <span className="flbl">Starting price (BDT)</span>
              <span className="money">
                <span className="cur">BDT</span>
                <input className={`inp !h-11 !text-[15px] ${errors.startingPrice ? "err" : ""}`} inputMode="numeric" placeholder="0" value={values.startingPrice} onChange={(e) => set({ startingPrice: e.target.value.replace(/\D/g, "").slice(0, 7) })} />
              </span>
              <span className="hint">
                <span className="ferr">{errors.startingPrice ?? ""}</span>
                {!errors.startingPrice && lowest !== null && Number(values.startingPrice || 0) !== lowest && (
                  <button type="button" className="underline underline-offset-2 font-semibold" onClick={() => set({ startingPrice: String(lowest) })}>
                    Use lowest live price BDT {lowest.toLocaleString("en-US")}
                  </button>
                )}
              </span>
            </label>

            <label className="block">
              <span className="flbl">Display order</span>
              <input className={`inp !h-11 text-sm ${errors.order ? "err" : ""}`} inputMode="numeric" value={values.order} onChange={(e) => set({ order: e.target.value.replace(/[^\d-]/g, "").slice(0, 5) })} />
              <Err msg={errors.order ?? undefined} />
            </label>

            <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3 mt-1">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] p-3.5 cursor-pointer">
                <span><b className="text-sm block">Visible</b><span className="text-xs text-[var(--mute)]">Show on home page &amp; shop</span></span>
                <span className="switch"><input type="checkbox" checked={values.isActive} onChange={(e) => set({ isActive: e.target.checked })} aria-label="Visible" /><span /></span>
              </label>
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] p-3.5 cursor-pointer">
                <span><b className="text-sm block">Featured</b><span className="text-xs text-[var(--mute)]">Highlight this category</span></span>
                <span className="switch"><input type="checkbox" checked={values.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} aria-label="Featured" /><span /></span>
              </label>
            </div>
          </div>

          <div>
            <span className="flbl">Preview</span>
            <CategoryCardPreview
              name={values.name.trim()}
              label={values.label.trim()}
              startingPrice={Number(values.startingPrice) || 0}
              bgColor={values.bgColor}
              accentColor={values.accentColor}
            />
          </div>
        </fieldset>

        <div className="sticky bottom-0 bg-[var(--bg)] px-6 sm:px-7 py-4 border-t border-[var(--line)] flex gap-3 justify-end">
          <button type="button" className="btn-ghost flex-1 sm:flex-none justify-center" disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-solid flex-[2] sm:flex-none justify-center sm:min-w-[160px]" disabled={saving}>
            {saving ? <span className="spin" /> : editing ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}
