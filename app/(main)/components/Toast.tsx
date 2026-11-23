"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-[calc(100%-2.5rem)] max-w-sm">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration ?? 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
  };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-xl border p-4 shadow-lg animate-in slide-in-from-right-5 duration-300 ${styles[toast.type ?? "success"]}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 font-bold">
        {icons[toast.type ?? "success"]}
      </span>

      <p className="flex-1 text-sm font-semibold">{toast.message}</p>

      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-lg opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
