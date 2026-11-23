"use client";

import { useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES } from "@/db/utils/imageHosts";

interface Props {
  multiple?: boolean;
  disabled?: boolean;
  title: string;
  hint: string;
  className?: string;
  invalid?: boolean;
  onFiles: (files: File[]) => void;
}

export default function ImageDropZone({ multiple, disabled, title, hint, className = "", invalid, onFiles }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const take = (list: FileList | null) => {
    if (!list?.length || disabled) return;
    onFiles(Array.from(list));
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={`drop ${over ? "dragover" : ""} ${disabled ? "opacity-50 !cursor-not-allowed" : ""} ${invalid ? "!border-[var(--ink)] !border-2" : ""} ${className}`}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          input.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files);
      }}
    >
      <svg className="w-8 h-8 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
      <b className="text-sm">{title}</b>
      <span className="text-xs text-[var(--mute)]">{hint}</span>
      <input
        ref={input}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        multiple={multiple}
        onChange={(e) => {
          take(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
