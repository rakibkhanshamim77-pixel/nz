"use client";

import { PRODUCT_LIMITS } from "@/db/validation/product.validation";
import { XIcon } from "./FormSection";
import ImageDropZone from "./ImageDropZone";
import ImageTile from "./ImageTile";
import type { ImageItem } from "./formTypes";

interface Props {
  gallery: ImageItem[];
  disabled?: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onMakeMain: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

export default function ProductGallery({ gallery, disabled, onAdd, onRemove, onMakeMain, onMove }: Props) {
  const max = PRODUCT_LIMITS.galleryMax;
  const full = gallery.length >= max;

  return (
    <div>
      <div className="flex items-center justify-between mt-7 mb-3">
        <p className="sub-h !mb-0">
          Gallery{" "}
          <span className="text-[var(--mute)] font-medium">
            ({gallery.length}/{max})
          </span>
        </p>
      </div>

      {gallery.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-3">
          {gallery.map((img, i) => (
            <li key={img.id} className="gal-tile group">
              <span className="n">{i + 1}</span>
              <ImageTile image={img} alt={`Gallery image ${i + 1}`} className="w-full h-full" />
              <button
                type="button"
                className="icon-btn absolute top-1.5 right-1.5 !w-7 !h-7 !rounded-lg z-[1]"
                aria-label={`Remove gallery image ${i + 1}`}
                disabled={disabled}
                onClick={() => onRemove(img.id)}
              >
                <XIcon />
              </button>
              <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1 z-[1] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  className="icon-btn !w-7 !h-7 !rounded-lg"
                  aria-label={`Move image ${i + 1} left`}
                  disabled={disabled || i === 0}
                  onClick={() => onMove(img.id, -1)}
                >
                  <svg fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24"><path d="M15 6 9 12l6 6" /></svg>
                </button>
                <button
                  type="button"
                  className="flex-1 h-7 rounded-lg bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold"
                  disabled={disabled}
                  onClick={() => onMakeMain(img.id)}
                >
                  Set main
                </button>
                <button
                  type="button"
                  className="icon-btn !w-7 !h-7 !rounded-lg"
                  aria-label={`Move image ${i + 1} right`}
                  disabled={disabled || i === gallery.length - 1}
                  onClick={() => onMove(img.id, 1)}
                >
                  <svg fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ImageDropZone
        multiple
        disabled={disabled || full}
        title={full ? "Gallery is full" : "Add gallery images"}
        hint={full ? `Remove an image to add another (max ${max})` : "Drop files here or click · JPG, PNG, WebP up to 5 MB each"}
        className="!min-h-[110px]"
        onFiles={onAdd}
      />
    </div>
  );
}
