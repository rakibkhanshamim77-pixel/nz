"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import Toast, { type ToastItem, type ToastType } from "@/app/(main)/components/Toast";

interface ToastState {
  toasts: ToastItem[];
}

type ToastAction =
  | { type: "ADD"; toast: ToastItem }
  | { type: "REMOVE"; id: string };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD":
      return { toasts: [...state.toasts, action.toast] };
    case "REMOVE":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const push = useCallback((message: string, type: ToastType, duration?: number) => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: "ADD", toast: { id, message, type, duration } });
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m, d) => push(m, "success", d),
      error: (m, d) => push(m, "error", d),
      info: (m, d) => push(m, "info", d),
      warning: (m, d) => push(m, "warning", d),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={state.toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
