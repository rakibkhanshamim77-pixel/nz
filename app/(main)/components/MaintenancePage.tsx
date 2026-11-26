interface Props {
  message: string;
}

export default function MaintenancePage({ message }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-[var(--bg)]">
      {/* Animated icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-[var(--soft)] border-2 border-[var(--line)] grid place-items-center">
          <svg
            className="w-12 h-12 text-[var(--mute)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            viewBox="0 0 24 24"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--mute)]/30 animate-spin" style={{ animationDuration: "8s" }} />
      </div>

      {/* Brand */}
      <p className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--mute)] mb-3">
        NEESHANZ
      </p>

      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-center text-[var(--ink)] leading-tight mb-4">
        Under Maintenance
      </h1>

      <p className="text-center text-[var(--mute)] max-w-md text-base leading-relaxed mb-8">
        {message}
      </p>

      {/* Divider with label */}
      <div className="flex items-center gap-3 w-full max-w-xs mb-8">
        <div className="flex-1 h-px bg-[var(--line)]" />
        <span className="text-xs text-[var(--mute)]">Be back soon</span>
        <div className="flex-1 h-px bg-[var(--line)]" />
      </div>

      {/* Social / contact strip */}
      <p className="text-sm text-[var(--mute)] text-center">
        Stay connected —{" "}
        <a
          href="https://facebook.com/neeshanz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--ink)] font-semibold hover:underline"
        >
          Facebook
        </a>
      </p>
    </div>
  );
}
