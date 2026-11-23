"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const CONTENT_TABS = [
  { value: "announcement", label: "Announcement", icon: "M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 0 17.5 11" },
  { value: "sale-banner", label: "Sale Banner", icon: "M9 14l-4-4 4-4M15 10l4 4-4 4M11 6l2 12" },
  { value: "newsletter", label: "Newsletter", icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
  { value: "delivery-exchange", label: "Delivery & Exchange", icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7z" },
  { value: "pages", label: "Static Pages", icon: "M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" },
  { value: "faqs", label: "FAQs", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
] as const;

export type ContentTab = (typeof CONTENT_TABS)[number]["value"];

export default function ContentNav({ currentTab }: { currentTab: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1.5 flex-wrap mb-6">
      {CONTENT_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => goTo(tab.value)}
          className={`inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors border ${
            currentTab === tab.value
              ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
              : "bg-[var(--bg)] text-[var(--mute)] border-[var(--line)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d={tab.icon} />
          </svg>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
