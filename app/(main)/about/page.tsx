/* eslint-disable react/no-unescaped-entities */
export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/db/content.server";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে – Neeshanz",
  description: "Neeshanz সম্পর্কে জানুন — আমাদের গল্প, লক্ষ্য এবং মূল্যবোধ।",
  alternates: { canonical: "/about" },
};

/* Fixed dark colour used for always-dark accent sections so they stay dark
   in both light AND dark theme (var(--ink) flips to near-white in dark mode). */
const DARK = "#111111";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4"
          fill={i < count ? "#f59e0b" : "none"}
          stroke={i < count ? "#f59e0b" : "#6b7280"}
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function AboutPage() {
  const c = await getContent("about");

  const stats = [
    { value: c.stat1Value, label: c.stat1Label },
    { value: c.stat2Value, label: c.stat2Label },
    { value: c.stat3Value, label: c.stat3Label },
  ];
  const processes = [
    { icon: c.process1Icon, title: c.process1Title, body: c.process1Body },
    { icon: c.process2Icon, title: c.process2Title, body: c.process2Body },
    { icon: c.process3Icon, title: c.process3Title, body: c.process3Body },
    { icon: c.process4Icon, title: c.process4Title, body: c.process4Body },
  ];
  const values = [
    { icon: c.value1Icon, title: c.value1Title, body: c.value1Body },
    { icon: c.value2Icon, title: c.value2Title, body: c.value2Body },
    { icon: c.value3Icon, title: c.value3Title, body: c.value3Body },
  ];
  const whys = [
    { icon: c.why1Icon, title: c.why1Title, body: c.why1Body },
    { icon: c.why2Icon, title: c.why2Title, body: c.why2Body },
    { icon: c.why3Icon, title: c.why3Title, body: c.why3Body },
    { icon: c.why4Icon, title: c.why4Title, body: c.why4Body },
  ];
  const milestones = [
    {
      year: c.milestone1Year,
      title: c.milestone1Title,
      body: c.milestone1Body,
    },
    {
      year: c.milestone2Year,
      title: c.milestone2Title,
      body: c.milestone2Body,
    },
    {
      year: c.milestone3Year,
      title: c.milestone3Title,
      body: c.milestone3Body,
    },
    {
      year: c.milestone4Year,
      title: c.milestone4Title,
      body: c.milestone4Body,
    },
  ];
  const reviews = [
    {
      name: c.review1Name,
      location: c.review1Location,
      stars: parseInt(c.review1Stars) || 5,
      body: c.review1Body,
    },
    {
      name: c.review2Name,
      location: c.review2Location,
      stars: parseInt(c.review2Stars) || 5,
      body: c.review2Body,
    },
    {
      name: c.review3Name,
      location: c.review3Location,
      stars: parseInt(c.review3Stars) || 5,
      body: c.review3Body,
    },
  ];
  const faqs = [
    { q: c.faq1Q, a: c.faq1A },
    { q: c.faq2Q, a: c.faq2A },
    { q: c.faq3Q, a: c.faq3A },
    { q: c.faq4Q, a: c.faq4A },
  ];

  return (
    <main className="pb-28 lg:pb-16">
      {/* ══ 1. HERO — always visible ══════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: DARK }}
      >
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle,#fff 0%,transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle,#fff 0%,transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <nav
            className="flex justify-center items-center gap-1.5 text-xs mb-8 opacity-50"
            style={{ color: "#fff" }}
          >
            <Link href="/" className="hover:opacity-100 transition-opacity">
              হোম
            </Link>
            <span>/</span>
            <span>আমাদের সম্পর্কে</span>
          </nav>
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-7"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Neeshanz — Since 2023
          </div>
          <h1
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            style={{ color: "#fff" }}
          >
            {c.heroTagline}
          </h1>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.68)" }}
          >
            {c.heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "#fff", color: DARK }}
            >
              কেনাকাটা করুন
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor: "rgba(255,255,255,0.25)", color: "#fff" }}
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 2. STATS ══════════════════════════════════════════════ */}
      {c.show_stats && (
        <section
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div
              className="grid grid-cols-3 divide-x"
              style={{ borderColor: "var(--line)" }}
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center px-4 sm:px-10">
                  <p
                    className="font-display font-extrabold text-3xl sm:text-4xl"
                    style={{ color: "var(--ink)" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-xs sm:text-sm mt-1.5"
                    style={{ color: "var(--mute)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 3. STORY ══════════════════════════════════════════════ */}
      {c.show_story && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-block w-10 h-1 rounded-full mb-5"
                style={{ background: "var(--ink)" }}
              />
              <h2
                className="font-display font-extrabold text-3xl sm:text-4xl mb-6 leading-tight"
                style={{ color: "var(--ink)" }}
              >
                {c.storyTitle}
              </h2>
              {c.storyBody
                .split("\n")
                .filter(Boolean)
                .map((para, i) => (
                  <p
                    key={i}
                    className="leading-relaxed mb-4 last:mb-0"
                    style={{ color: "var(--mute)" }}
                  >
                    {para}
                  </p>
                ))}
            </div>
            {/* NZ brand card — always dark */}
            <div
              className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
              style={{ background: DARK }}
            >
              <div
                aria-hidden
                className="absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10"
                style={{
                  background: "radial-gradient(circle,#fff 0%,transparent 70%)",
                }}
              />
              <p
                className="font-display font-extrabold text-7xl sm:text-8xl mb-4"
                style={{ color: "rgba(255,255,255,0.1)" }}
              >
                NZ
              </p>
              <p
                className="font-display font-bold text-2xl mb-2"
                style={{ color: "#fff" }}
              >
                Neeshanz
              </p>
              <p
                className="text-sm mb-8"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                বাংলাদেশি ফ্যাশন ব্র্যান্ড
              </p>
              <div
                className="border-t space-y-3 pt-6"
                style={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                {[
                  "সারা বাংলাদেশে ডেলিভারি",
                  "৭ দিনের ফ্রি এক্সচেঞ্জ",
                  "১০০% অরিজিনাল পণ্য",
                  "নিরাপদ অনলাইন পেমেন্ট",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full grid place-items-center text-xs flex-shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        color: "#fff",
                      }}
                    >
                      ✓
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 4. MILESTONES ════════════════════════════════════════ */}
      {c.show_milestones && (
        <section
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <div
                className="inline-block w-10 h-1 rounded-full mb-5"
                style={{ background: "var(--ink)" }}
              />
              <h2
                className="font-display font-extrabold text-3xl sm:text-4xl"
                style={{ color: "var(--ink)" }}
              >
                {c.milestonesTitle}
              </h2>
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
                style={{ background: "var(--line)" }}
              />
              <div className="space-y-6 sm:space-y-0">
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className="sm:grid sm:grid-cols-2 sm:gap-8 relative"
                  >
                    <div
                      className={`${i % 2 === 0 ? "sm:flex sm:justify-end" : "sm:order-2 sm:flex sm:justify-start"} mb-4 sm:mb-0 sm:py-6`}
                    >
                      {i % 2 === 0 ? (
                        <div
                          className="rounded-2xl p-5 border w-full sm:max-w-xs"
                          style={{
                            background: "var(--bg)",
                            borderColor: "var(--line)",
                          }}
                        >
                          <span
                            className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
                            style={{ background: DARK, color: "#fff" }}
                          >
                            {m.year}
                          </span>
                          <h3
                            className="font-display font-bold text-lg mb-2"
                            style={{ color: "var(--ink)" }}
                          >
                            {m.title}
                          </h3>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: "var(--mute)" }}
                          >
                            {m.body}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                    {/* centre dot */}
                    <div
                      aria-hidden
                      className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10"
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--ink)",
                      }}
                    />
                    <div
                      className={`${i % 2 === 1 ? "sm:flex sm:justify-start" : "sm:order-2 sm:flex sm:justify-end"} sm:py-6`}
                    >
                      {i % 2 === 1 ? (
                        <div
                          className="rounded-2xl p-5 border w-full sm:max-w-xs"
                          style={{
                            background: "var(--bg)",
                            borderColor: "var(--line)",
                          }}
                        >
                          <span
                            className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
                            style={{ background: DARK, color: "#fff" }}
                          >
                            {m.year}
                          </span>
                          <h3
                            className="font-display font-bold text-lg mb-2"
                            style={{ color: "var(--ink)" }}
                          >
                            {m.title}
                          </h3>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: "var(--mute)" }}
                          >
                            {m.body}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 5. MISSION QUOTE — always dark ═══════════════════════ */}
      {c.show_missionQuote && (
        <section style={{ background: DARK }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <svg
              aria-hidden
              className="w-10 h-10 mx-auto mb-6 opacity-25"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#fff" }}
            >
              <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.364zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.496 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.364z" />
            </svg>
            <blockquote
              className="font-display font-bold text-xl sm:text-2xl leading-relaxed mb-6"
              style={{ color: "#fff" }}
            >
              {c.missionQuote}
            </blockquote>
            <p
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              — {c.missionAuthor}
            </p>
          </div>
        </section>
      )}

      {/* ══ 6. PROCESS ══════════════════════════════════════════ */}
      {c.show_process && (
        <section
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <div
                className="inline-block w-10 h-1 rounded-full mb-5"
                style={{ background: "var(--ink)" }}
              />
              <h2
                className="font-display font-extrabold text-3xl sm:text-4xl"
                style={{ color: "var(--ink)" }}
              >
                {c.processTitle}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div
                aria-hidden
                className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px"
                style={{ background: "var(--line)" }}
              />
              {processes.map((p, i) => (
                <div key={i} className="text-center relative">
                  <div
                    className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl mb-5 mx-auto"
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--line)",
                      zIndex: 1,
                    }}
                  >
                    {p.icon}
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold grid place-items-center"
                      style={{ background: DARK, color: "#fff" }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3
                    className="font-display font-bold text-base mb-2"
                    style={{ color: "var(--ink)" }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--mute)" }}
                  >
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 7. VALUES ════════════════════════════════════════════ */}
      {c.show_values && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <div
              className="inline-block w-10 h-1 rounded-full mb-5"
              style={{ background: "var(--ink)" }}
            />
            <h2
              className="font-display font-extrabold text-3xl sm:text-4xl"
              style={{ color: "var(--ink)" }}
            >
              আমাদের মূল্যবোধ
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 border hover:shadow-md transition-shadow"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--line)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl grid place-items-center text-2xl mb-5"
                  style={{ background: DARK, color: "#fff" }}
                >
                  {v.icon}
                </div>
                <h3
                  className="font-display font-bold text-lg mb-3"
                  style={{ color: "var(--ink)" }}
                >
                  {v.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--mute)" }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ 8. WHY CHOOSE US ════════════════════════════════════ */}
      {c.show_why && (
        <section
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <div
                className="inline-block w-10 h-1 rounded-full mb-5"
                style={{ background: "var(--ink)" }}
              />
              <h2
                className="font-display font-extrabold text-3xl sm:text-4xl"
                style={{ color: "var(--ink)" }}
              >
                {c.whyTitle}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whys.map((w, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 border hover:border-[var(--ink)] transition-colors"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--line)",
                  }}
                >
                  <span className="text-3xl block mb-4">{w.icon}</span>
                  <h3
                    className="font-display font-bold text-sm mb-2"
                    style={{ color: "var(--ink)" }}
                  >
                    {w.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--mute)" }}
                  >
                    {w.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 9. TESTIMONIALS ═════════════════════════════════════ */}
      {c.show_testimonials && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <div
              className="inline-block w-10 h-1 rounded-full mb-5"
              style={{ background: "var(--ink)" }}
            />
            <h2
              className="font-display font-extrabold text-3xl sm:text-4xl"
              style={{ color: "var(--ink)" }}
            >
              {c.testimonialsTitle}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border flex flex-col"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--line)",
                }}
              >
                <Stars count={r.stars} />
                <p
                  className="text-sm leading-relaxed mt-4 flex-1"
                  style={{ color: "var(--mute)" }}
                >
                  "{r.body}"
                </p>
                <div
                  className="flex items-center gap-3 mt-6 pt-4 border-t"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center font-bold text-sm flex-shrink-0"
                    style={{ background: DARK, color: "#fff" }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--ink)" }}
                    >
                      {r.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--mute)" }}>
                      {r.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ 10. FOUNDER NOTE ════════════════════════════════════ */}
      {c.show_founder && (
        <section
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-10">
              <div
                className="inline-block w-10 h-1 rounded-full mb-5"
                style={{ background: "var(--ink)" }}
              />
              <h2
                className="font-display font-extrabold text-3xl sm:text-4xl"
                style={{ color: "var(--ink)" }}
              >
                {c.founderTitle}
              </h2>
            </div>
            <div
              className="rounded-3xl p-8 sm:p-10 border relative overflow-hidden"
              style={{ background: "var(--bg)", borderColor: "var(--line)" }}
            >
              <div
                aria-hidden
                className="absolute top-6 right-8 font-display font-extrabold text-8xl leading-none select-none pointer-events-none"
                style={{ color: "var(--line)", lineHeight: 1 }}
              >
                "
              </div>
              <p
                className="text-base sm:text-lg leading-relaxed mb-8 relative"
                style={{ color: "var(--mute)" }}
              >
                "{c.founderNote}"
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full grid place-items-center font-display font-extrabold text-lg flex-shrink-0"
                  style={{ background: DARK, color: "#fff" }}
                >
                  {c.founderName.charAt(0)}
                </div>
                <div>
                  <p
                    className="font-display font-bold"
                    style={{ color: "var(--ink)" }}
                  >
                    {c.founderName}
                  </p>
                  <p className="text-sm" style={{ color: "var(--mute)" }}>
                    {c.founderRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 11. MINI FAQ ════════════════════════════════════════ */}
      {c.show_faq && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <div
              className="inline-block w-10 h-1 rounded-full mb-5"
              style={{ background: "var(--ink)" }}
            />
            <h2
              className="font-display font-extrabold text-3xl sm:text-4xl"
              style={{ color: "var(--ink)" }}
            >
              {c.faqTitle}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border overflow-hidden"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--line)",
                }}
              >
                <summary
                  className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-semibold text-sm"
                  style={{ color: "var(--ink)" }}
                >
                  {faq.q}
                  <svg
                    className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    style={{ color: "var(--mute)" }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div
                  className="px-6 pb-5 text-sm leading-relaxed border-t"
                  style={{ color: "var(--mute)", borderColor: "var(--line)" }}
                >
                  <p className="pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
          <p
            className="text-center mt-8 text-sm"
            style={{ color: "var(--mute)" }}
          >
            আরও প্রশ্ন আছে?{" "}
            <Link
              href="/contact"
              className="font-semibold underline underline-offset-2"
              style={{ color: "var(--ink)" }}
            >
              আমাদের সাথে যোগাযোগ করুন
            </Link>
          </p>
        </section>
      )}

      {/* ══ 12. COMMUNITY — always dark ═══════════════════════════ */}
      {c.show_community && (
        <section style={{ background: DARK }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid sm:grid-cols-2 gap-10 items-center">
              <div>
                <div
                  className="inline-block w-10 h-1 rounded-full mb-5"
                  style={{ background: "rgba(255,255,255,0.3)" }}
                />
                <h2
                  className="font-display font-extrabold text-3xl sm:text-4xl mb-5 leading-tight"
                  style={{ color: "#fff" }}
                >
                  {c.communityTitle}
                </h2>
                <p
                  className="text-base leading-relaxed mb-8"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  {c.communityBody}
                </p>
                <div className="flex gap-4 flex-wrap">
                  {c.communityFbLink && (
                    <a
                      href={c.communityFbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
                      style={{ background: "#1877f2", color: "#fff" }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </a>
                  )}
                  {c.communityIgLink && (
                    <a
                      href={c.communityIgLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
                      style={{
                        background:
                          "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                        color: "#fff",
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                      </svg>
                      Instagram
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { n: "১০K+", l: "কাস্টমার" },
                  { n: "৫০০+", l: "ডিজাইন" },
                  { n: "৬৪", l: "জেলা" },
                  { n: "৯৯%", l: "সন্তুষ্টি" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl p-5 text-center"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <p
                      className="font-display font-extrabold text-3xl mb-1"
                      style={{ color: "#fff" }}
                    >
                      {s.n}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 13. CLOSING CTA ═════════════════════════════════════ */}
      {c.show_closing && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div
            className="inline-block w-10 h-1 rounded-full mb-6"
            style={{ background: "var(--ink)" }}
          />
          <h2
            className="font-display font-extrabold text-3xl sm:text-4xl mb-5 leading-tight"
            style={{ color: "var(--ink)" }}
          >
            {c.closingTitle}
          </h2>
          <p
            className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: "var(--mute)" }}
          >
            {c.closingBody}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "var(--ink)", color: "var(--bg)" }}
            >
              নতুন কালেকশন দেখুন
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm border hover:bg-[var(--surface)] transition-colors"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            >
              আমাদের সাথে যোগাযোগ করুন
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
