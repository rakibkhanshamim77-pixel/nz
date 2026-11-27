"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { uploadProductImage } from "@/db/actions/admin/image-upload.action";
import { createProduct, updateProduct } from "@/db/actions/admin/product.admin.action";
import {
  PRODUCT_LIMITS,
  validateProduct,
  type ProductFieldKey,
  type ProductPayload,
} from "@/db/validation/product.validation";
import DiscardDialog from "./DiscardDialog";
import FormSection from "./FormSection";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductColorImages from "./ProductColorImages";
import ProductColors from "./ProductColors";
import ProductCompletion from "./ProductCompletion";
import ProductDescription, { toEditorHtml } from "./ProductDescription";
import ProductFeatures from "./ProductFeatures";
import ProductFeaturedToggle from "./ProductFeaturedToggle";
import ProductFormActions from "./ProductFormActions";
import ProductImages from "./ProductImages";
import ProductInventory from "./ProductInventory";
import ProductPreview from "./ProductPreview";
import ProductPricing from "./ProductPricing";
import { toPublishIso } from "./ProductSchedule";
import ProductSizeChart from "./ProductSizeChart";
import ProductSizes from "./ProductSizes";
import ProductStatus from "./ProductStatus";
import {
  checkImageFile,
  fingerprintOf,
  uid,
  type CategoryOption,
  type FormErrors,
  type FormPatch,
  type ImageItem,
  type LocalImage,
  type ProductFormInitial,
  type ProductFormState,
} from "./formTypes";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

interface Props {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initial?: ProductFormInitial;
  lowStockThreshold: number;
}

const LIST_URL = "/admin/products";

/** Where each server field error is shown, in on-page order — used to scroll to the first problem. */
const ERROR_SECTIONS: [ProductFieldKey, string][] = [
  ["name", "sec-basic"], ["sku", "sec-basic"], ["category", "sec-basic"], ["description", "sec-basic"],
  ["regularPrice", "sec-pricing"], ["salePrice", "sec-pricing"], ["stock", "sec-inventory"],
  ["images", "sec-images"], ["colors", "sec-variants"], ["colorImages", "sec-variants"], ["sizes", "sec-variants"],
  ["sizeChart", "sec-chart"], ["features", "sec-features"], ["publishAt", "sec-status"],
  ["status", "sec-status"], ["isFeatured", "sec-status"],
];

/** Which error keys a form change should clear. */
const PATCH_CLEARS: Partial<Record<keyof ProductFormState, ProductFieldKey[]>> = {
  thumbnail: ["images"], gallery: ["images"], colorImages: ["colorImages"],
  publishDate: ["publishAt"], publishTime: ["publishAt"],
  status: ["publishAt"], regularPrice: ["regularPrice", "salePrice"],
};

function initialState(initial?: ProductFormInitial): ProductFormState {
  if (!initial) {
    return {
      name: "", sku: "", category: "", description: "", regularPrice: "", salePrice: "", stock: "",
      thumbnail: null, gallery: [], colors: [], colorImages: {}, sizes: ["S", "M", "L", "XL", "XXL"],
      features: [], sizeChart: [], status: "active", publishDate: "", publishTime: "10:00", isFeatured: false,
    };
  }
  const [first, ...rest] = initial.images;
  const scheduled = initial.isActive && !!initial.publishAt && new Date(initial.publishAt).getTime() > Date.now();
  return {
    name: initial.name,
    sku: initial.sku,
    category: initial.category,
    description: toEditorHtml(initial.description),
    regularPrice: String(initial.regularPrice),
    salePrice: initial.salePrice > 0 && initial.salePrice < initial.regularPrice ? String(initial.salePrice) : "",
    stock: String(initial.stock),
    thumbnail: first ? { id: uid("img"), kind: "remote", url: first } : null,
    gallery: rest.map((url) => ({ id: uid("img"), kind: "remote", url })),
    colors: initial.colors,
    colorImages: Object.fromEntries(
      initial.colors
        .filter((c) => initial.colorImages[c]?.length)
        .map((c) => [c, initial.colorImages[c].map((url) => ({ id: uid("ci"), kind: "remote" as const, url }))]),
    ),
    sizes: initial.sizes,
    features: initial.features,
    sizeChart: initial.sizeChart.map((r) => ({ ...r, id: uid("row") })),
    status: !initial.isActive ? "draft" : scheduled ? "scheduled" : "active",
    publishDate: "",
    publishTime: "10:00",
    isFeatured: initial.isFeatured,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function ProductForm({ mode, categories, initial, lowStockThreshold }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<ProductFormState>(() => initialState(initial));
  const [errors, setErrors] = useState<FormErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [shake, setShake] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);

  const formRef = useRef(form);
  formRef.current = form;

  // Date/time depend on the admin's timezone, so they're filled in after hydration
  useEffect(() => {
    const at = initial?.publishAt ? new Date(initial.publishAt) : null;
    const fallback = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setForm((f) => ({
      ...f,
      publishDate: localDate(at && at.getTime() > Date.now() ? at : fallback),
      publishTime: at && at.getTime() > Date.now() ? localTime(at) : "10:00",
    }));
  }, [initial?.publishAt]);

  // Free blob: previews when the page unmounts
  useEffect(
    () => () => {
      const { thumbnail, gallery } = formRef.current;
      [thumbnail, ...gallery].forEach((img) => img?.kind === "local" && URL.revokeObjectURL(img.preview));
    },
    [],
  );

  const update = useCallback((patch: FormPatch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
    setErrors((prev) => {
      const keys = Object.keys(patch).flatMap(
        (k) => PATCH_CLEARS[k as keyof ProductFormState] ?? [k as ProductFieldKey],
      );
      if (!keys.some((k) => prev[k])) return prev;
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const onDescription = useCallback(
    (html: string) => {
      if (html !== formRef.current.description) update({ description: html });
    },
    [update],
  );

  /* ---------------- Images ---------------- */

  function toLocal(files: File[]): LocalImage[] {
    const { thumbnail, gallery } = formRef.current;
    const taken = new Set(
      [thumbnail, ...gallery].flatMap((img) => (img?.kind === "local" ? [img.fingerprint] : [])),
    );
    const accepted: LocalImage[] = [];
    for (const file of files) {
      const problem = checkImageFile(file);
      if (problem) {
        toast.error(problem);
        continue;
      }
      const fingerprint = fingerprintOf(file);
      if (taken.has(fingerprint)) {
        toast.info(`${file.name} is already added`);
        continue;
      }
      taken.add(fingerprint);
      accepted.push({
        id: uid("img"), kind: "local", file, fingerprint,
        preview: URL.createObjectURL(file), status: "idle",
      });
    }
    return accepted;
  }

  const release = (img: ImageItem | null | undefined) => {
    if (img?.kind === "local") URL.revokeObjectURL(img.preview);
  };

  function pickThumbnail(file: File) {
    const [img] = toLocal([file]);
    if (!img) return;
    release(formRef.current.thumbnail);
    update({ thumbnail: img });
  }

  function addGallery(files: File[]) {
    const room = PRODUCT_LIMITS.galleryMax - formRef.current.gallery.length;
    if (files.length > room) toast.info(`Only ${room} more gallery image${room === 1 ? "" : "s"} can be added`);
    const imgs = toLocal(files.slice(0, Math.max(0, room)));
    if (imgs.length) update({ gallery: [...formRef.current.gallery, ...imgs] });
  }

  function removeGallery(id: string) {
    release(formRef.current.gallery.find((g) => g.id === id));
    update({ gallery: formRef.current.gallery.filter((g) => g.id !== id) });
  }

  function makeMain(id: string) {
    const { thumbnail, gallery } = formRef.current;
    const idx = gallery.findIndex((g) => g.id === id);
    if (idx < 0) return;
    const next = [...gallery];
    if (thumbnail) next.splice(idx, 1, thumbnail);
    else next.splice(idx, 1);
    update({ thumbnail: gallery[idx], gallery: next });
  }

  function moveGallery(id: string, dir: -1 | 1) {
    const next = [...formRef.current.gallery];
    const i = next.findIndex((g) => g.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update({ gallery: next });
  }

  function patchLocal(id: string, patch: Partial<LocalImage>) {
    const apply = (img: ImageItem | null) =>
      img && img.kind === "local" && img.id === id ? { ...img, ...patch } : img;
    setForm((f) => ({
      ...f,
      thumbnail: apply(f.thumbnail),
      gallery: f.gallery.map((g) => apply(g)!),
      colorImages: Object.fromEntries(
        Object.entries(f.colorImages).map(([c, imgs]) => [c, imgs.map((img) => apply(img)!)]),
      ),
    }));
  }

  /* ---------------- Submit ---------------- */

  function fail(errs: FormErrors, message?: string) {
    setErrors(errs);
    const count = Object.keys(errs).length;
    toast.error(message ?? `Please fix ${count} field${count > 1 ? "s" : ""} before saving`);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    const first = ERROR_SECTIONS.find(([k]) => errs[k]);
    if (first) document.getElementById(first[1])?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function payloadFrom(
    f: ProductFormState,
    images: string[],
    colorImages: Record<string, string[]>,
  ): ProductPayload {
    return {
      name: f.name, sku: f.sku, category: f.category, description: f.description,
      regularPrice: f.regularPrice, salePrice: f.salePrice, stock: f.stock, images,
      colors: f.colors, colorImages, sizes: f.sizes, features: f.features,
      sizeChart: f.sizeChart.map(({ size, chest, length, sleeve }) => ({ size, chest, length, sleeve })),
      status: f.status,
      publishAt: f.status === "scheduled" ? toPublishIso(f.publishDate, f.publishTime) : "",
      isFeatured: f.isFeatured,
    };
  }

  /** Build colorImages placeholder map (local:id for unuploaded, url for already-remote). */
  function colorImagePlaceholders(ci: Record<string, ImageItem[]>): Record<string, string[]> {
    return Object.fromEntries(
      Object.entries(ci)
        .map(([c, imgs]) => [c, imgs.map((img) => (img.kind === "remote" ? img.url : `local:${img.id}`))])
        .filter(([, urls]) => (urls as string[]).length > 0),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const f = formRef.current;
    const ordered = [f.thumbnail, ...f.gallery].filter((x): x is ImageItem => !!x);
    const placeholders = ordered.map((img) => (img.kind === "remote" ? img.url : `local:${img.id}`));

    const check = validateProduct(payloadFrom(f, placeholders, colorImagePlaceholders(f.colorImages)));
    if (!check.ok) return fail(check.errors);

    setSaving(true);
    try {
      const urls = new Map<string, string>();

      // Collect all pending local images: main (thumbnail + gallery) and color images
      const mainPending = ordered.filter((img): img is LocalImage => img.kind === "local" && !img.uploadedUrl);
      const colorPending: LocalImage[] = Object.values(f.colorImages)
        .flat()
        .filter((img): img is LocalImage => img.kind === "local" && !img.uploadedUrl);
      // Deduplicate by id (same file might be in multiple places, though UI prevents it)
      const allPending = Array.from(
        new Map([...mainPending, ...colorPending].map((img) => [img.id, img])).values(),
      );

      for (let i = 0; i < allPending.length; i++) {
        const img = allPending[i];
        setProgress(`Uploading image ${i + 1} of ${allPending.length}…`);
        patchLocal(img.id, { status: "uploading", error: undefined });
        const fd = new FormData();
        fd.append("image", img.file);
        const res = await uploadProductImage(fd).catch(() => ({
          ok: false as const,
          error: "Upload failed — check your connection and try again.",
        }));
        if (!res.ok) {
          patchLocal(img.id, { status: "error", error: res.error });
          return fail({ images: res.error }, res.error);
        }
        urls.set(img.id, res.url);
        patchLocal(img.id, { status: "done", uploadedUrl: res.url });
      }

      const resolve = (img: ImageItem) =>
        img.kind === "remote" ? img.url : (img.uploadedUrl ?? urls.get(img.id) ?? "");

      const images = ordered.map(resolve);

      // Build final colorImages with real URLs, only for colors still in the colors list
      const finalColorImages: Record<string, string[]> = {};
      for (const color of f.colors) {
        const imgs = f.colorImages[color];
        if (!imgs?.length) continue;
        const resolved = imgs.map(resolve).filter(Boolean);
        if (resolved.length) finalColorImages[color] = resolved;
      }

      setProgress(mode === "create" ? "Creating product…" : "Saving changes…");
      const payload = payloadFrom(f, images, finalColorImages);
      const res =
        mode === "create"
          ? await createProduct(payload)
          : await updateProduct(initial!.id, payload, initial!.updatedAt);

      if (!res.ok) {
        if (res.fieldErrors && Object.keys(res.fieldErrors).length) return fail(res.fieldErrors, res.error);
        toast.error(res.error);
        return;
      }

      setDirty(false);
      toast.success(mode === "create" ? `"${payload.name.trim()}" was created` : "Product updated");
      router.push(LIST_URL);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
      setProgress("");
    }
  }

  /* ---------------- Leaving ---------------- */

  const blockNavigation = useCallback((href: string) => setLeaveTo(href), []);
  useUnsavedChangesGuard(dirty && !saving, blockNavigation);

  const cancel = () => (dirty ? setLeaveTo(LIST_URL) : router.push(LIST_URL));

  const leave = () => {
    const href = leaveTo ?? LIST_URL;
    setDirty(false);
    setLeaveTo(null);
    router.push(href);
  };

  return (
    <>
      <form id="product-form" noValidate onSubmit={onSubmit}>
        <fieldset
          disabled={saving}
          className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-5 sm:gap-6 items-start min-w-0 border-0 p-0 m-0"
        >
          <div className="space-y-5 sm:space-y-6 min-w-0">
            <ProductBasicInfo
              name={form.name}
              sku={form.sku}
              category={form.category}
              categories={categories}
              errors={errors}
              onChange={update}
            >
              <ProductDescription initialHtml={form.description} error={errors.description} onChange={onDescription} />
            </ProductBasicInfo>

            <ProductPricing regularPrice={form.regularPrice} salePrice={form.salePrice} errors={errors} onChange={update} />

            <ProductInventory stock={form.stock} lowStockThreshold={lowStockThreshold} errors={errors} onChange={update} />

            <ProductImages
              thumbnail={form.thumbnail}
              gallery={form.gallery}
              error={errors.images}
              disabled={saving}
              onPickThumbnail={pickThumbnail}
              onRemoveThumbnail={() => {
                release(formRef.current.thumbnail);
                update({ thumbnail: null });
              }}
              onAddGallery={addGallery}
              onRemoveGallery={removeGallery}
              onMakeMain={makeMain}
              onMoveGallery={moveGallery}
            />

            <FormSection
              id="sec-variants"
              title="Variants"
              description="Colours and sizes customers can choose"
              icon={<><circle cx="8" cy="8" r="4" /><circle cx="16" cy="8" r="4" /><circle cx="12" cy="15" r="4" /></>}
            >
              <ProductColors colors={form.colors} error={errors.colors} onChange={(colors) => update({ colors })} />
              <ProductColorImages
                colors={form.colors}
                colorImages={form.colorImages}
                disabled={saving}
                onChange={(colorImages) => update({ colorImages })}
                onError={(msg) => toast.error(msg)}
              />
              <div className="h-px bg-[var(--line)] my-6" />
              <ProductSizes sizes={form.sizes} error={errors.sizes} onChange={(sizes) => update({ sizes })} />
            </FormSection>

            <ProductSizeChart
              rows={form.sizeChart}
              sizes={form.sizes}
              error={errors.sizeChart}
              onChange={(sizeChart) => update({ sizeChart })}
            />

            <ProductFeatures features={form.features} error={errors.features} onChange={(features) => update({ features })} />
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24">
            <ProductStatus
              status={form.status}
              publishDate={form.publishDate}
              publishTime={form.publishTime}
              error={errors.publishAt}
              onChange={update}
            />
            <ProductFeaturedToggle checked={form.isFeatured} onChange={(isFeatured) => update({ isFeatured })} />
            <ProductPreview form={form} categories={categories} />
            <ProductCompletion form={form} />
          </aside>
        </fieldset>
      </form>

      <ProductFormActions
        dirty={dirty}
        saving={saving}
        progress={progress}
        shake={shake}
        submitLabel={mode === "create" ? "Save Product" : "Update Product"}
        onCancel={cancel}
      />

      <DiscardDialog open={leaveTo !== null} onStay={() => setLeaveTo(null)} onLeave={leave} />
    </>
  );
}
