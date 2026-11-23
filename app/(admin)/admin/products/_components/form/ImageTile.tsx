"use client";

import { imageSrc, type ImageItem } from "./formTypes";

/** Square image preview with upload-state overlay. */
export default function ImageTile({ image, alt, className = "" }: { image: ImageItem; alt: string; className?: string }) {
  const uploading = image.kind === "local" && image.status === "uploading";
  const failed = image.kind === "local" && image.status === "error";
  const pending = image.kind === "local" && !image.uploadedUrl && image.status === "idle";

  return (
    <span className={`img-box has ${className}`}>
      {/* Blob previews and remote images both render here, so next/image isn't used */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc(image)} alt={alt} className={uploading ? "opacity-50" : ""} />
      {uploading && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="ld" aria-label="Uploading" />
        </span>
      )}
      {failed && (
        <span className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold px-2 py-1 text-left" title={image.error}>
          Upload failed — will retry on save
        </span>
      )}
      {pending && (
        <span className="absolute bottom-1.5 left-1.5 h-5 px-1.5 rounded-md bg-[var(--surface)] border border-[var(--line)] text-[10px] font-bold grid place-items-center">
          New
        </span>
      )}
    </span>
  );
}
