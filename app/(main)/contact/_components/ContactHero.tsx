interface Props {
  title: string;
  description: string;
}

export default function ContactHero({ title, description }: Props) {
  return (
    <section className="pt-12 pb-10 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] text-sm text-[var(--mute)] mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
        </svg>
        Contact Us
      </div>
      <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-4 text-[var(--ink)]">
        {title}
      </h1>
      <p className="max-w-xl mx-auto text-base sm:text-lg text-[var(--mute)] leading-relaxed">
        {description}
      </p>
    </section>
  );
}
