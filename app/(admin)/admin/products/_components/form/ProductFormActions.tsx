"use client";

interface Props {
  dirty: boolean;
  saving: boolean;
  progress: string;
  submitLabel: string;
  shake: boolean;
  onCancel: () => void;
}

export default function ProductFormActions({ dirty, saving, progress, submitLabel, shake, onCancel }: Props) {
  return (
    <div className="save-bar fixed bottom-0 right-0 left-0 lg:left-[264px] z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-3 max-w-[1400px] flex items-center gap-3">
        <p className="hidden sm:flex items-center gap-2 text-sm text-[var(--mute)] mr-auto" aria-live="polite">
          <span className={`w-2 h-2 rounded-full ${dirty ? "bg-[var(--ink)]" : "bg-[var(--line)]"}`} />
          <span>{saving ? progress : dirty ? "Unsaved changes" : "No changes yet"}</span>
        </p>
        <button type="button" className="btn-ghost flex-1 sm:flex-none justify-center" disabled={saving} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          form="product-form"
          disabled={saving}
          className={`btn-solid flex-[2] sm:flex-none justify-center sm:min-w-[180px] ${shake ? "shake" : ""} ${saving ? "loading" : ""}`}
        >
          {saving ? (
            <>
              <span className="spin" />
              <span className="sm:hidden">{progress}</span>
              <span className="hidden sm:inline">Saving…</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 5 5L20 7" />
              </svg>
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
