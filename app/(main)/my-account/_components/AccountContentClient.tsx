"use client";

import { useEffect, useState } from "react";

interface Props {
  sections: { id: string; label: string; content: React.ReactNode }[];
}

const SECTION_LABELS: Record<string, string> = {
  dashboard: "ড্যাশবোর্ড",
  orders: "আমার অর্ডার",
  profile: "প্রোফাইল",
  addresses: "ঠিকানা",
  settings: "সেটিংস",
};

export default function AccountContentClient({ sections }: Props) {
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const syncHash = () => setActive(window.location.hash.slice(1) || "dashboard");
    const onNav = (e: Event) => setActive((e as CustomEvent<string>).detail);

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    window.addEventListener("account-nav", onNav);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
      window.removeEventListener("account-nav", onNav);
    };
  }, []);

  function goBack() {
    setActive("dashboard");
    window.dispatchEvent(new CustomEvent("account-nav", { detail: "dashboard" }));
    history.pushState(null, "", window.location.pathname);
  }

  const isDashboard = active === "dashboard";

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile section header with back button (hide on dashboard) */}
      {!isDashboard && (
        <div className="lg:hidden flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-soft flex items-center justify-center hover:bg-line transition-colors"
            aria-label="মেনুতে ফিরুন"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M15 6 9 12l6 6" />
            </svg>
          </button>
          <span className="font-display font-bold text-lg">{SECTION_LABELS[active] ?? active}</span>
        </div>
      )}

      {sections.map(({ id, content }) => (
        <div
          key={id}
          className={id !== active ? "hidden lg:block" : undefined}
        >
          {content}
        </div>
      ))}
    </div>
  );
}
