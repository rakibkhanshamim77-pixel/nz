interface Props {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  compact?: boolean;
}

export default function FormSection({ id, title, description, icon, action, children, compact }: Props) {
  return (
    <section id={id} className="card sec scroll-mt-24" aria-labelledby={`${id}-title`}>
      <header className={`sec-h ${compact ? "!mb-4" : ""}`}>
        {icon && (
          <span className="sec-i" aria-hidden="true">
            <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              {icon}
            </svg>
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h2 id={`${id}-title`} className="font-display">
            {title}
          </h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  return (
    <span id={id} className="ferr" role={message ? "alert" : undefined}>
      {message ?? ""}
    </span>
  );
}

export const XIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const PlusIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
