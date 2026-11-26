"use client";

import FormSection, { FieldError, XIcon } from "./FormSection";
import ImageDropZone from "./ImageDropZone";
import ImageTile from "./ImageTile";
import ProductGallery from "./ProductGallery";
import type { ImageItem } from "./formTypes";

interface Props {
  thumbnail: ImageItem | null;
  gallery: ImageItem[];
  error?: string;
  disabled?: boolean;
  onPickThumbnail: (file: File) => void;
  onRemoveThumbnail: () => void;
  onAddGallery: (files: File[]) => void;
  onRemoveGallery: (id: string) => void;
  onMakeMain: (id: string) => void;
  onMoveGallery: (id: string, dir: -1 | 1) => void;
}

export default function ProductImages({
  thumbnail, gallery, error, disabled,
  onPickThumbnail, onRemoveThumbnail, onAddGallery, onRemoveGallery, onMakeMain, onMoveGallery,
}: Props) {
  return (
    <FormSection
      id="sec-images"
      title="Product Images"
      description="Images are saved to VPS storage when you save"
      icon={<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-8 8" /></>}
    >
      <p className="sub-h">Main image (thumbnail) *</p>
      <div className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-4 items-start">
        {thumbnail ? (
          <ImageTile image={thumbnail} alt="Main product image" className="aspect-square" />
        ) : (
          <ImageDropZone
            title="Add main image"
            hint="Drop or click"
            className="aspect-square !min-h-0"
            disabled={disabled}
            invalid={!!error}
            onFiles={(files) => files[0] && onPickThumbnail(files[0])}
          />
        )}
        <div>
          <p className="text-sm text-[var(--mute)] leading-relaxed">
            Shown on shop cards, search and as the first image on the product page. A square image of at
            least 1000 × 1000 px works best.
          </p>
          {thumbnail && (
            <div className="flex flex-wrap gap-2 mt-3">
              <label className={`btn-ghost !h-10 text-sm ${disabled ? "opacity-45 pointer-events-none" : "cursor-pointer"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                  <path d="M18 3v4h-4M6 21v-4h4" />
                </svg>
                Replace
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={disabled}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPickThumbnail(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <button type="button" className="btn-ghost !h-10 text-sm" disabled={disabled} onClick={onRemoveThumbnail}>
                <XIcon className="w-4 h-4" />
                Remove
              </button>
            </div>
          )}
          <span className="hint">
            <FieldError id="images-err" message={error} />
          </span>
        </div>
      </div>

      <ProductGallery
        gallery={gallery}
        disabled={disabled}
        onAdd={onAddGallery}
        onRemove={onRemoveGallery}
        onMakeMain={onMakeMain}
        onMove={onMoveGallery}
      />
    </FormSection>
  );
}
