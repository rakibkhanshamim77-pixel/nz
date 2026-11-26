/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { ContentSlug, AboutContent } from "@/db/content";
import { CONTENT_DEFAULTS } from "@/db/content";
import SizeGuideEditor from "./SizeGuideEditor";
import RichTextEditor from "./RichTextEditor";

const PAGE_OPTIONS = [
  { slug: "about" as ContentSlug, label: "About Us" },
  { slug: "size-guide" as ContentSlug, label: "Size Guide" },
  { slug: "terms" as ContentSlug, label: "Terms & Conditions" },
  { slug: "return-policy" as ContentSlug, label: "Return Policy" },
  { slug: "privacy" as ContentSlug, label: "Privacy Policy" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  pages: Record<string, Record<string, any>>;
}

function Field({
  label,
  hint,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="field block">
      <span className="lbl">{label}</span>
      {multiline ? (
        <textarea
          rows={rows}
          className="inp text-sm"
          style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="inp text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && (
        <p className="text-xs mt-1" style={{ color: "var(--mute)" }}>
          {hint}
        </p>
      )}
    </label>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest pt-2 pb-1 border-b"
      style={{ color: "var(--mute)", borderColor: "var(--line)" }}
    >
      {label}
    </p>
  );
}

const SECTION_TOGGLES: { key: keyof AboutContent; label: string }[] = [
  { key: "show_stats", label: "Stats" },
  { key: "show_story", label: "Our Story" },
  { key: "show_milestones", label: "Milestones" },
  { key: "show_missionQuote", label: "Mission Quote" },
  { key: "show_process", label: "Process Steps" },
  { key: "show_values", label: "Values" },
  { key: "show_why", label: "Why Us?" },
  { key: "show_testimonials", label: "Reviews" },
  { key: "show_founder", label: "Founder's Note" },
  { key: "show_faq", label: "FAQ" },
  { key: "show_community", label: "Community" },
  { key: "show_closing", label: "Closing CTA" },
];

function AboutForm({
  data,
  onChange,
}: {
  data: AboutContent;
  onChange: (k: keyof AboutContent, v: string | boolean) => void;
}) {
  const f = (k: keyof AboutContent) => ({
    value: data[k] as string,
    onChange: (v: string) => onChange(k, v),
  });

  return (
    <div className="space-y-5">
      {/* Section visibility toggles */}
      <div
        className="rounded-2xl border p-5 space-y-3"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--mute)" }}
        >
          Show / Hide Sections
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTION_TOGGLES.map(({ key, label }) => {
            const on = data[key] as boolean;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key, !on)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors text-left"
                style={{
                  borderColor: on ? "var(--ink)" : "var(--line)",
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "var(--bg)" : "var(--mute)",
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-sm border flex-shrink-0 grid place-items-center text-[10px]"
                  style={{
                    borderColor: on ? "var(--bg)" : "var(--line)",
                    background: on ? "var(--bg)" : "transparent",
                    color: "var(--ink)",
                  }}
                >
                  {on ? "✓" : ""}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs" style={{ color: "var(--mute)" }}>
          Toggle sections to show or hide them. Changes apply to the site immediately after saving.
        </p>
      </div>

      <SectionHeader label="Hero Section" />
      <Field label="Tagline" hint="Main heading" {...f("heroTagline")} />
      <Field label="Subtitle" multiline rows={2} {...f("heroSubtitle")} />

      <SectionHeader label="Stats (3 items)" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {([1, 2, 3] as const).map((n) => (
          <div
            key={n}
            className="space-y-2 p-3 rounded-xl border"
            style={{ borderColor: "var(--line)" }}
          >
            <Field
              label={`#${n} Value`}
              {...f(`stat${n}Value` as keyof AboutContent)}
            />
            <Field
              label="Label"
              {...f(`stat${n}Label` as keyof AboutContent)}
            />
          </div>
        ))}
      </div>

      <SectionHeader label="Our Story" />
      <Field label="Title" {...f("storyTitle")} />
      <Field
        label="Body"
        multiline
        rows={6}
        hint="Use new lines to separate paragraphs"
        {...f("storyBody")}
      />

      <SectionHeader label="Mission Quote" />
      <Field label="Quote" multiline rows={3} {...f("missionQuote")} />
      <Field label="Author" {...f("missionAuthor")} />

      <SectionHeader label="How We Work (4 steps)" />
      <Field label="Section title" {...f("processTitle")} />
      <div className="grid sm:grid-cols-2 gap-3">
        {([1, 2, 3, 4] as const).map((n) => (
          <div
            key={n}
            className="p-3 rounded-xl border space-y-2"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex gap-3">
              <div className="w-24 flex-shrink-0">
                <Field
                  label={`#${n} Icon`}
                  hint="Emoji"
                  {...f(`process${n}Icon` as keyof AboutContent)}
                />
              </div>
              <div className="flex-1">
                <Field
                  label="Title"
                  {...f(`process${n}Title` as keyof AboutContent)}
                />
              </div>
            </div>
            <Field
              label="Description"
              multiline
              rows={2}
              {...f(`process${n}Body` as keyof AboutContent)}
            />
          </div>
        ))}
      </div>

      <SectionHeader label="Our Values (3 items)" />
      {([1, 2, 3] as const).map((n) => (
        <div
          key={n}
          className="p-3 rounded-xl border space-y-2"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex gap-3">
            <div className="w-24 flex-shrink-0">
              <Field
                label={`#${n} Icon`}
                hint="Emoji / Symbol"
                {...f(`value${n}Icon` as keyof AboutContent)}
              />
            </div>
            <div className="flex-1">
              <Field
                label="Title"
                {...f(`value${n}Title` as keyof AboutContent)}
              />
            </div>
          </div>
          <Field
            label="Description"
            multiline
            rows={2}
            {...f(`value${n}Body` as keyof AboutContent)}
          />
        </div>
      ))}

      <SectionHeader label="Why Choose Neeshanz (4 items)" />
      <Field label="Section title" {...f("whyTitle")} />
      <div className="grid sm:grid-cols-2 gap-3">
        {([1, 2, 3, 4] as const).map((n) => (
          <div
            key={n}
            className="p-3 rounded-xl border space-y-2"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex gap-3">
              <div className="w-24 flex-shrink-0">
                <Field
                  label={`#${n} Icon`}
                  hint="Emoji"
                  {...f(`why${n}Icon` as keyof AboutContent)}
                />
              </div>
              <div className="flex-1">
                <Field
                  label="Title"
                  {...f(`why${n}Title` as keyof AboutContent)}
                />
              </div>
            </div>
            <Field
              label="Description"
              multiline
              rows={2}
              {...f(`why${n}Body` as keyof AboutContent)}
            />
          </div>
        ))}
      </div>

      <SectionHeader label="Founder's Note" />
      <Field label="Section title" {...f("founderTitle")} />
      <Field label="Name" {...f("founderName")} />
      <Field label="Role" {...f("founderRole")} />
      <Field label="Message" multiline rows={4} {...f("founderNote")} />

      <SectionHeader label="Milestones (4 items)" />
      <Field label="Section title" {...f("milestonesTitle")} />
      {([1, 2, 3, 4] as const).map((n) => (
        <div
          key={n}
          className="p-3 rounded-xl border space-y-2"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex gap-3">
            <div className="w-28 flex-shrink-0">
              <Field
                label={`#${n} Year`}
                {...f(`milestone${n}Year` as keyof AboutContent)}
              />
            </div>
            <div className="flex-1">
              <Field
                label="Title"
                {...f(`milestone${n}Title` as keyof AboutContent)}
              />
            </div>
          </div>
          <Field
            label="Description"
            multiline
            rows={2}
            {...f(`milestone${n}Body` as keyof AboutContent)}
          />
        </div>
      ))}

      <SectionHeader label="Customer Reviews (3 items)" />
      <Field label="Section title" {...f("testimonialsTitle")} />
      {([1, 2, 3] as const).map((n) => (
        <div
          key={n}
          className="p-3 rounded-xl border space-y-2"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="grid grid-cols-3 gap-2">
            <Field
              label={`#${n} Name`}
              {...f(`review${n}Name` as keyof AboutContent)}
            />
            <Field
              label="Location"
              {...f(`review${n}Location` as keyof AboutContent)}
            />
            <Field
              label="Rating (1–5)"
              hint="Number"
              {...f(`review${n}Stars` as keyof AboutContent)}
            />
          </div>
          <Field
            label="Review"
            multiline
            rows={3}
            {...f(`review${n}Body` as keyof AboutContent)}
          />
        </div>
      ))}

      <SectionHeader label="Community / Social Media" />
      <Field label="Section title" {...f("communityTitle")} />
      <Field label="Description" multiline rows={3} {...f("communityBody")} />
      <Field
        label="Facebook link"
        hint="https://facebook.com/..."
        {...f("communityFbLink")}
      />
      <Field
        label="Instagram link"
        hint="https://instagram.com/..."
        {...f("communityIgLink")}
      />

      <SectionHeader label="FAQ (4 items)" />
      <Field label="Section title" {...f("faqTitle")} />
      {([1, 2, 3, 4] as const).map((n) => (
        <div
          key={n}
          className="p-3 rounded-xl border space-y-2"
          style={{ borderColor: "var(--line)" }}
        >
          <Field
            label={`#${n} Question`}
            {...f(`faq${n}Q` as keyof AboutContent)}
          />
          <Field
            label="Answer"
            multiline
            rows={2}
            {...f(`faq${n}A` as keyof AboutContent)}
          />
        </div>
      ))}

      <SectionHeader label="Closing Section" />
      <Field label="Title" {...f("closingTitle")} />
      <Field label="Description" multiline rows={3} {...f("closingBody")} />
    </div>
  );
}

function buildAboutFromPage(page: Record<string, unknown>): AboutContent {
  const def = CONTENT_DEFAULTS["about"];
  const keys = Object.keys(def) as (keyof AboutContent)[];
  const result = { ...def } as AboutContent;
  for (const k of keys) {
    if (page[k] !== undefined) {
      // boolean fields stored as actual boolean or "true"/"false" string
      if (typeof def[k] === "boolean") {
        (result as unknown as Record<string, unknown>)[k] =
          page[k] === false ? false : page[k] !== "false";
      } else {
        (result as unknown as Record<string, unknown>)[k] = page[k];
      }
    }
  }
  return result;
}

export default function PagesEditor({ pages }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSlug, setSelectedSlug] = useState<ContentSlug>("about");
  const [body, setBody] = useState(() => pages["about"]?.body ?? "");
  const [aboutData, setAboutData] = useState<AboutContent>(() =>
    buildAboutFromPage(pages["about"] ?? {}),
  );
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function handlePageChange(slug: ContentSlug) {
    setSelectedSlug(slug);
    setBody(pages[slug]?.body ?? "");
    setSaved(false);
    setErr("");
  }

  function handleAboutChange(k: keyof AboutContent, v: string | boolean) {
    setAboutData((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const data = selectedSlug === "about" ? aboutData : { body };
      const res = await saveContent(selectedSlug, data);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  if (selectedSlug === "size-guide") {
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {PAGE_OPTIONS.map((opt) => (
            <button
              key={opt.slug}
              type="button"
              onClick={() => handlePageChange(opt.slug)}
              className={`h-9 px-4 rounded-xl text-sm font-medium border transition-colors ${
                selectedSlug === opt.slug
                  ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
                  : "border-[var(--line)] text-[var(--mute)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <SizeGuideEditor data={pages["size-guide"]} />
      </div>
    );
  }

  return (
    <div className="card p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl">Static Pages</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--mute)" }}>
          Edit the content of static pages.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {PAGE_OPTIONS.map((opt) => (
          <button
            key={opt.slug}
            type="button"
            onClick={() => handlePageChange(opt.slug)}
            className={`h-9 px-4 rounded-xl text-sm font-medium border transition-colors ${
              selectedSlug === opt.slug
                ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
                : "border-[var(--line)] text-[var(--mute)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {selectedSlug === "about" ? (
          <AboutForm data={aboutData} onChange={handleAboutChange} />
        ) : (
          <RichTextEditor
            key={selectedSlug}
            initialHtml={body}
            label={PAGE_OPTIONS.find((p) => p.slug === selectedSlug)?.label}
            placeholder="Write page content — you can use headings, paragraphs, lists…"
            onChange={(html) => {
              setBody(html);
              setSaved(false);
            }}
          />
        )}

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && (
          <p className="text-sm text-green-600 font-medium">
            ✓ Saved
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-solid disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
