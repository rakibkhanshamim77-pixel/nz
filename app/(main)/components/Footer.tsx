import Link from "next/link";
import { getStoreSettings } from "@/db/settings.server";

const SHOP_LINKS = [
  { label: "সব পণ্য", href: "/shop" },
  { label: "নতুন আগমন", href: "/shop?sort=new" },
  { label: "বেস্ট সেলার", href: "/shop?sort=pop" },
  { label: "অফার", href: "/shop?onSale=1" },
  { label: "ক্যাটাগরি", href: "/categories" },
];

const HELP_LINKS = [
  { label: "অর্ডার ট্র্যাক", href: "/track-order" },
  { label: "সাইজ গাইড", href: "/size-guide" },
  { label: "প্রশ্নোত্তর (FAQ)", href: "/faq" },
  { label: "রিটার্ন পলিসি", href: "/return-policy" },
  { label: "যোগাযোগ করুন", href: "/contact" },
];

const COMPANY_LINKS = [
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "যোগাযোগ", href: "/contact" },
  { label: "আমার কার্ট", href: "/cart" },
  { label: "আমার অ্যাকাউন্ট", href: "/my-account" },
];

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "ক্যাশ অন ডেলিভারি"];

export default async function Footer() {
  const { store } = await getStoreSettings();

  return (
    <footer className="mt-24 border-t border-line">
      {/* ── main grid ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">

        {/* brand column */}
        <div>
          <p className="font-display font-bold text-xl text-ink tracking-tight mb-3">
            Neeshanz
          </p>
          <p className="text-sm text-mute leading-relaxed max-w-xs">
            ট্রেন্ডি ফ্যাশন, স্টাইলিশ পোশাক আর প্রতিদিনের আরাম।
            আধুনিক ডিজাইন, সাশ্রয়ী দাম, সারা দেশে ডেলিভারি।
          </p>

          {/* trust badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["দ্রুত ডেলিভারি", "ফ্রি এক্সচেঞ্জ", "নিরাপদ পেমেন্ট"].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line text-xs text-mute"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* shop */}
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-ink mb-4">
            শপ
          </p>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-mute hover:text-ink transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* help */}
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-ink mb-4">
            সহায়তা
          </p>
          <ul className="space-y-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-mute hover:text-ink transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact + company */}
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-ink mb-4">
            যোগাযোগ
          </p>
          <ul className="space-y-2.5 text-sm text-mute">
            <li>শনি–বৃহস্পতি, সকাল ১০টা – রাত ৮টা</li>
            {store.supportPhone && (
              <li>
                <a
                  href={`tel:${store.supportPhone}`}
                  className="hover:text-ink transition-colors"
                >
                  {store.supportPhone}
                </a>
              </li>
            )}
            {store.supportEmail && (
              <li>
                <a
                  href={`mailto:${store.supportEmail}`}
                  className="hover:text-ink transition-colors"
                >
                  {store.supportEmail}
                </a>
              </li>
            )}
            {store.address && <li>{store.address}</li>}
          </ul>

          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-ink mt-7 mb-4">
            কোম্পানি
          </p>
          <ul className="space-y-2.5">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-mute hover:text-ink transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── payment methods ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 border-t border-line flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-mute">পেমেন্ট পদ্ধতি</span>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => (
            <span
              key={m}
              className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink bg-bg"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* ── copyright ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 border-t border-line flex flex-wrap items-center justify-between gap-3 pb-28 lg:pb-5">
        <span className="text-sm text-mute">
          <b className="text-ink">Neeshanz</b> © ২০২৬ — সর্বস্বত্ব সংরক্ষিত।
        </span>
        <span className="flex items-center gap-4 text-sm text-mute">
          <Link href="/privacy-policy" className="hover:text-ink transition-colors">
            গোপনীয়তা নীতি
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-ink transition-colors">
            শর্তাবলি
          </Link>
          <a
            href="#"
            className="px-3 py-1.5 rounded-full border border-line hover:text-ink hover:border-ink transition-colors text-xs"
          >
            উপরে যান ↑
          </a>
        </span>
      </div>
    </footer>
  );
}
