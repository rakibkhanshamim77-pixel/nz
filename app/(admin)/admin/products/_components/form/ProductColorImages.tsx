"use client";

import { useState } from "react";
import { PRODUCT_LIMITS } from "@/db/validation/product.validation";
import { checkImageFile, fingerprintOf, imageSrc, uid, type ImageItem, type LocalImage } from "./formTypes";
import { colorHex } from "./ProductColors";
import { XIcon } from "./FormSection";

interface Props {
  colors: string[];
  colorImages: Record<string, ImageItem[]>;
  disabled?: boolean;
  onChange: (colorImages: Record<string, ImageItem[]>) => void;
  onError: (msg: string) => void;
}

const MAX = PRODUCT_LIMITS.colorImagesMax;

export default function ProductColorImages({ colors, colorImages, disabled, onChange, onError }: Props) {
  const [open, setOpen] = useState(false);

  if (colors.length === 0) return null;

  // Auto-open when any color already has images
  const hasAny = colors.some((c) => (colorImages[c]?.length ?? 0) > 0);

  function addImages(color: string, files: FileList | null) {
    if (!files?.length) return;
    const existing = colorImages[color] ?? [];
    const taken = new Set(
      existing.flatMap((img) => (img.kind === "local" ? [img.fingerprint] : [])),
    );
    const toAdd: LocalImage[] = [];
    for (const file of Array.from(files).slice(0, MAX - existing.length)) {
      const err = checkImageFile(file);
      if (err) { onError(err); continue; }
      const fp = fingerprintOf(file);
      if (taken.has(fp)) continue;
      taken.add(fp);
      toAdd.push({
        id: uid("ci"),
        kind: "local",
        file,
        fingerprint: fp,
        preview: URL.createObjectURL(file),
        status: "idle",
      });
    }
    if (toAdd.length) onChange({ ...colorImages, [color]: [...existing, ...toAdd] });
  }

  function removeImage(color: string, id: string) {
    const imgs = colorImages[color] ?? [];
    const img = imgs.find((i) => i.id === id);
    if (img?.kind === "local") URL.revokeObjectURL(img.preview);
    const updated = imgs.filter((i) => i.id !== id);
    const next = { ...colorImages };
    if (updated.length) next[color] = updated;
    else delete next[color];
    onChange(next);
  }

  const isOpen = open || hasAny;

  return (
    <div className="mt-5">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span>
          <p className="sub-h !mb-0.5">Color images <span className="text-[var(--mute)] font-normal text-xs">— optional</span></p>
          <p className="text-xs text-[var(--mute)]">Override gallery images for a specific color when selected</p>
        </span>
        <svg
          className={`w-4 h-4 text-[var(--mute)] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-4">
          {colors.map((color) => {
            const imgs = colorImages[color] ?? [];
            const full = imgs.length >= MAX;
            const hex = colorHex(color);

            return (
              <div key={color} className="flex flex-wrap items-start gap-3">
                {/* Color label */}
                <div className="flex items-center gap-2 w-28 shrink-0 pt-1">
                  <span
                    className="sw-dot shrink-0"
                    style={{ background: hex ?? "var(--soft)" }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold truncate" title={color}>{color}</span>
                </div>

                {/* Image tiles */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {imgs.map((img) => {
                    const uploading = img.kind === "local" && img.status === "uploading";
                    const failed = img.kind === "local" && img.status === "error";
                    return (
                      <div key={img.id} className="relative w-14 h-14 rounded-xl overflow-hidden bg-[var(--soft)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageSrc(img)}
                          alt=""
                          className={`w-full h-full object-cover ${uploading ? "opacity-40" : ""}`}
                        />
                        {uploading && (
                          <span className="absolute inset-0 grid place-items-center">
                            <span className="ld" aria-label="Uploading" />
                          </span>
                        )}
                        {failed && (
                          <span
                            className="absolute inset-0 bg-black/60 grid place-items-center"
                            title={img.kind === "local" ? img.error : undefined}
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path d="M12 9v4m0 4h.01M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
                            </svg>
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => removeImage(color, img.id)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70 transition"
                          aria-label={`Remove image from ${color}`}
                        >
                          <XIcon className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}

                  {!full && (
                    <label
                      className={`w-14 h-14 rounded-xl border-2 border-dashed border-[var(--line)] grid place-items-center transition shrink-0 ${
                        disabled
                          ? "opacity-45 cursor-not-allowed"
                          : "cursor-pointer hover:border-[var(--ink)] hover:bg-[var(--soft)]"
                      }`}
                      title={`Add images for ${color}`}
                    >
                      <svg className="w-4 h-4 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="sr-only"
                        disabled={disabled}
                        onChange={(e) => {
                          addImages(color, e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}

                  {imgs.length === 0 && (
                    <span className="text-xs text-[var(--mute)] self-center italic">
                      using product images
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
