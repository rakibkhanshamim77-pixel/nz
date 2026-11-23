const STEPS = [
  {
    id: 1,
    title: "বুকের মাপ",
    desc: "বুকের সবচেয়ে চওড়া অংশের চারদিকে ফিতা মাপুন। ফিতা সমতল ও আঁটসাঁট থাকা উচিত।",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="10" y="14" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M10 22h28M18 14v20M30 14v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 24h6M38 24h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 22l-2 2 2 2M43 22l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "কাঁধের মাপ",
    desc: "এক কাঁধের সীমা থেকে অন্য কাঁধের সীমা পর্যন্ত পিছনদিক থেকে মাপুন।",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
        <path d="M12 20c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 18l-2 2 2 2M43 18l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 20v16M36 20v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "দৈর্ঘ্যের মাপ",
    desc: "কাঁধের উপরের অংশ থেকে পোশাকের নিচের প্রান্ত পর্যন্ত সোজা মাপুন।",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
        <path d="M24 6v36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 8l2-2 2 2M22 40l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 14h8M14 34h8M26 14h8M26 34h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "হাতার মাপ",
    desc: "টি-শার্ট ও পোলোর ক্ষেত্রে হাতার প্রান্ত থেকে কাঁধের সেলাই পর্যন্ত মাপুন।",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
        <path d="M8 24h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 22l-2 2 2 2M39 22l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 16c0 0 8 4 8 8s-8 8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function HowToMeasure() {
  return (
    <section className="mb-12">
      <h2 className="font-display font-bold text-xl mb-2">কীভাবে মাপবেন?</h2>
      <p className="text-mute text-sm mb-6">
        সঠিক মাপ নিতে নিচের ধাপগুলো অনুসরণ করুন। একটি নরম ফিতা ব্যবহার করুন।
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className="bg-surface border border-line rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className="w-14 h-14 rounded-xl bg-soft flex items-center justify-center text-ink">
              {step.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-ink mb-1">
                <span className="text-ink font-bold mr-1">{step.id}.</span>
                {step.title}
              </p>
              <p className="text-xs text-mute leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
