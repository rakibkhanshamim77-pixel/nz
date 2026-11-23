interface Props {
  mapUrl: string;
}

export default function ContactMap({ mapUrl }: Props) {
  if (!mapUrl) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display font-bold text-xl text-[var(--ink)] mb-4">Our Location</h2>
      <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-[var(--line)]">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Business Location"
        />
      </div>
    </section>
  );
}
