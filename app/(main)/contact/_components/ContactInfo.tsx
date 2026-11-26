import type { ContactSettings } from "@/db/settings";

interface Props {
  settings: ContactSettings;
}

export default function ContactInfo({ settings }: Props) {
  const items = [
    settings.phone && {
      icon: "M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498A1 1 0 0 1 21 15.72V19a2 2 0 0 1-2 2H17c-8.284 0-15-6.716-15-15V5z",
      label: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone}`,
    },
    settings.whatsapp && {
      icon: "M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 21l3.9-.875A9.959 9.959 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z",
      label: "WhatsApp",
      value: settings.whatsapp,
      href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
    },
    settings.supportEmail && {
      icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
      label: "Email",
      value: settings.supportEmail,
      href: `mailto:${settings.supportEmail}`,
    },
    settings.address && {
      icon: "M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
      label: "Address",
      value: settings.address,
      href: undefined,
    },
    settings.businessHours && {
      icon: "M12 8v4l3 3M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
      label: "Business Hours",
      value: settings.businessHours,
      href: undefined,
    },
  ].filter(Boolean) as { icon: string; label: string; value: string; href?: string }[];

  const socials = [
    settings.facebook && { label: "Facebook", href: settings.facebook, path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
    settings.instagram && { label: "Instagram", href: settings.instagram, path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" },
  ].filter(Boolean) as { label: string; href: string; path: string }[];

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-5">
      <h2 className="font-display font-bold text-xl text-[var(--ink)]">Contact Information</h2>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--soft)] grid place-items-center shrink-0">
              <svg className="w-5 h-5 text-[var(--ink)]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path d={item.icon} />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold text-[var(--mute)] uppercase tracking-wide mb-0.5">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-sm font-medium text-[var(--ink)] hover:underline underline-offset-2">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm font-medium text-[var(--ink)]">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {socials.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--mute)] uppercase tracking-wide mb-3">Follow Us</p>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--bg)] grid place-items-center hover:bg-[var(--soft)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
