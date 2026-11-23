"use client";

import { useEffect, useState } from "react";

export default function PushNotificationSetup() {
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "unsupported">("idle");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "granted") setStatus("granted");
    else if (perm === "denied") setStatus("denied");
    else {
      try {
        const val = localStorage.getItem("push-dismissed");
        if (val) setDismissed(true);
      } catch {}
    }
  }, []);

  async function enable() {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setStatus("denied"); return; }

      const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!pub) { setStatus("granted"); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pub) as unknown as ArrayBuffer,
      });

      await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      setStatus("granted");
    } catch (err) {
      console.error("[push] enable failed:", err);
      setStatus("denied");
    }
  }

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem("push-dismissed", "1"); } catch {}
  }

  if (status === "unsupported" || status === "granted" || dismissed) return null;

  return (
    <div className="mx-6 mt-4 p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-[var(--soft)] grid place-items-center shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-0.5">Enable push notifications</p>
        <p className="text-xs text-[var(--mute)]">
          Get notified of new orders and messages even when you&apos;re not on this tab.
        </p>
        {status === "denied" && (
          <p className="text-xs text-red-600 mt-1">Notifications were denied. Please allow them in browser settings.</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {status !== "denied" && (
          <button
            type="button"
            onClick={enable}
            disabled={status === "loading"}
            className="btn-solid !h-8 !px-3 !text-xs !rounded-[10px] disabled:opacity-40"
          >
            {status === "loading" ? "Enabling…" : "Enable"}
          </button>
        )}
        <button type="button" onClick={dismiss} className="icon-btn !w-7 !h-7" aria-label="Dismiss">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}
