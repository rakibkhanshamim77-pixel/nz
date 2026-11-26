interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function PageHeader({
  eyebrow = "Products",
  title,
  description,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={className}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">
          {eyebrow}
        </span>
      )}

      <h2 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
        {title}
      </h2>

      {description && <p className="text-mute text-sm mt-3">{description}</p>}
    </div>
  );
}
