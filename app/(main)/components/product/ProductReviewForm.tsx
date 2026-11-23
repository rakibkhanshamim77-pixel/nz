"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { verifyPurchase, submitReview } from "@/db/actions/review.action";
import { Star } from "lucide-react";

interface ProductReviewFormProps {
  sizeOptions: string[];
  colorOptions: string[];
  productSlug: string;
}

const STAR_LABELS: Record<number, string> = {
  5: "অসাধারণ",
  4: "ভালো",
  3: "মোটামুটি",
  2: "খারাপ",
  1: "খুব খারাপ",
};

const MAX_TEXT = 600;
const MAX_PHOTOS = 3;

type VerifyState =
  | { step: "idle" }
  | { step: "pending" }
  | { step: "invalid_phone" }
  | { step: "not_purchased" }
  | { step: "not_delivered"; status: string; orderNumber: string }
  | { step: "cancelled"; orderNumber: string }
  | {
      step: "verified";
      orderNumber: string;
      customerName: string;
      orderedSize?: string;
      orderedColor?: string;
    };

type SubmitState = "idle" | "pending" | "done" | "error";

export default function ProductReviewForm({
  sizeOptions,
  colorOptions,
  productSlug,
}: ProductReviewFormProps) {
  const [phone, setPhone] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>({ step: "idle" });
  const [isVerifying, startVerify] = useTransition();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [formError, setFormError] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [isSubmitting, startSubmit] = useTransition();

  const nameRef = useRef<HTMLInputElement>(null);

  // Pre-fill name from verification result
  useEffect(() => {
    if (
      verifyState.step === "verified" &&
      nameRef.current &&
      !nameRef.current.value
    ) {
      nameRef.current.value = verifyState.customerName;
    }
  }, [verifyState]);

  // Revoke blob URLs on unmount
  useEffect(
    () => () => photos.forEach((p) => URL.revokeObjectURL(p.url)),
    [photos],
  );

  const handleVerify = () => {
    const raw = phone.trim();
    if (!raw) return;
    startVerify(async () => {
      setVerifyState({ step: "pending" });
      const result = await verifyPurchase(raw, productSlug);
      if (!result.ok) {
        switch (result.reason) {
          case "invalid_phone":
            setVerifyState({ step: "invalid_phone" });
            break;
          case "not_purchased":
            setVerifyState({ step: "not_purchased" });
            break;
          case "cancelled":
            setVerifyState({
              step: "cancelled",
              orderNumber: result.orderNumber,
            });
            break;
          case "not_delivered":
            setVerifyState({
              step: "not_delivered",
              status: result.orderStatus,
              orderNumber: result.orderNumber,
            });
            break;
        }
      } else {
        setVerifyState({
          step: "verified",
          orderNumber: result.orderNumber,
          customerName: result.customerName,
          orderedSize: result.orderedSize,
          orderedColor: result.orderedColor,
        });
      }
    });
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    if (files.length > room)
      setFormError(`সর্বোচ্চ ${MAX_PHOTOS}টি ছবি যোগ করা যাবে।`);
    setPhotos((prev) => [...prev, ...picked]);
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (verifyState.step !== "verified") return;

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const size = String(form.get("size") ?? "").trim() || undefined;
    const color = String(form.get("color") ?? "").trim() || undefined;
    const fit = String(form.get("fit") ?? "").trim() || undefined;

    if (!rating) return setFormError("অনুগ্রহ করে রেটিং দিন।");
    if (name.length < 2) return setFormError("অনুগ্রহ করে আপনার নাম লিখুন।");
    if (!title) return setFormError("রিভিউয়ের একটি শিরোনাম লিখুন।");
    if (text.trim().length < 10)
      return setFormError("বিস্তারিত রিভিউ কমপক্ষে ১০ অক্ষরের হতে হবে।");

    setFormError("");

    startSubmit(async () => {
      setSubmitState("pending");
      const res = await submitReview({
        productSlug,
        orderNumber: verifyState.orderNumber,
        phone: phone.trim(),
        rating,
        customerName: name,
        size,
        color,
        fit,
        title,
        comment: text.trim(),
      });
      if (res.success) {
        setSubmitState("done");
      } else {
        setSubmitState("error");
        setFormError(res.error ?? "রিভিউ জমা দিতে সমস্যা হয়েছে।");
      }
    });
  };

  const isLoading = isVerifying || verifyState.step === "pending";

  return (
    <div id="write-review" className="hidden target:block mb-6 scroll-mt-24">
      {/* Success state */}
      {submitState === "done" ? (
        <div className="card p-7 text-center">
          <div className="w-14 h-14 rounded-full bg-teal/15 grid place-items-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-teal"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-xl mb-2">
            ধন্যবাদ আপনার রিভিউর জন্য!
          </h3>
          <p className="text-mute text-sm mb-5">
            আপনার রিভিউটি যাচাইয়ের পর প্রকাশিত হবে।
          </p>
          <a
            href="#reviews"
            className="inline-flex h-10 px-6 rounded-xl border border-line font-semibold text-sm items-center hover:bg-soft"
          >
            বন্ধ করুন
          </a>
        </div>
      ) : (
        <form className="card p-5 sm:p-7" noValidate onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-xl">আপনার রিভিউ</h3>
            <a
              href="#reviews"
              className="w-9 h-9 rounded-full border border-line grid place-items-center hover:bg-soft"
              aria-label="বন্ধ করুন"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </a>
          </div>

          {/* Step 1 — Phone verification */}
          <div className="mb-6 p-4 rounded-2xl border border-line bg-soft/50">
            <label className="block mb-3">
              <span className="lbl">মোবাইল নম্বর দিয়ে ক্রয় যাচাই করুন *</span>
              <div className="flex gap-2 mt-1">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (verifyState.step !== "idle")
                      setVerifyState({ step: "idle" });
                  }}
                  placeholder="01XXXXXXXXX"
                  maxLength={14}
                  className="inp flex-1 font-mono tracking-wider"
                  disabled={verifyState.step === "verified"}
                />
                {verifyState.step !== "verified" ? (
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isLoading || phone.trim().length < 11}
                    className="h-10 px-4 rounded-xl bg-ink text-bg text-sm font-semibold hover:opacity-90 disabled:opacity-40 shrink-0 transition"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                    ) : (
                      "যাচাই করুন"
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyState({ step: "idle" });
                      setRating(0);
                      setText("");
                      setPhotos([]);
                      setFormError("");
                      setSubmitState("idle");
                    }}
                    className="h-10 px-4 rounded-xl border border-line text-sm font-semibold hover:bg-soft shrink-0 transition"
                  >
                    পরিবর্তন
                  </button>
                )}
              </div>
            </label>

            {/* Verification feedback */}
            {verifyState.step === "invalid_phone" && (
              <p className="text-sm font-medium text-red-600 mt-2" role="alert">
                ⚠ সঠিক মোবাইল নম্বর লিখুন (যেমন: 01XXXXXXXXX)
              </p>
            )}

            {verifyState.step === "not_purchased" && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20 p-4">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  এই পণ্যটি ক্রয় করা হয়নি
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  এই নম্বর দিয়ে পণ্যটি অর্ডার করা হয়নি। প্রথমে পণ্যটি কিনুন,
                  তারপর রিভিউ দিন।
                </p>
                <a
                  href="/shop"
                  className="inline-flex mt-3 h-9 px-4 rounded-xl bg-wine text-white text-sm font-semibold items-center gap-1.5 hover:opacity-90"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  পণ্য কিনুন
                </a>
              </div>
            )}

            {verifyState.step === "not_delivered" && (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20 p-4">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  অর্ডার #{verifyState.orderNumber} — এখনো ডেলিভার হয়নি
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  বর্তমান অবস্থা:{" "}
                  <span className="font-semibold">{verifyState.status}</span>
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  পণ্য ডেলিভার হওয়ার পরে রিভিউ দিতে পারবেন।
                </p>
              </div>
            )}

            {verifyState.step === "cancelled" && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20 p-4">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  অর্ডার #{verifyState.orderNumber} বাতিল হয়েছে
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  বাতিল বা ফেরত দেওয়া অর্ডারের জন্য রিভিউ দেওয়া যাবে না।
                </p>
              </div>
            )}

            {verifyState.step === "verified" && (
              <div className="mt-3 rounded-xl border border-teal/30 bg-teal/10 p-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-teal shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <p className="text-sm font-semibold text-teal">
                  ক্রয় যাচাই হয়েছে — অর্ডার #{verifyState.orderNumber}
                </p>
              </div>
            )}
          </div>

          {/* Step 2 — Review form (shown only after verification) */}
          {verifyState.step === "verified" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Rating */}
              <fieldset className="sm:col-span-2">
                <legend className="lbl">রেটিং দিন *</legend>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="star-pick">
                    {[5, 4, 3, 2, 1].map((value) => (
                      <Fragment key={value}>
                        <input
                          type="radio"
                          name="rating"
                          id={`r${value}`}
                          value={value}
                          checked={rating === value}
                          onChange={() => {
                            setRating(value);
                            setFormError("");
                          }}
                        />

                        <label
                          htmlFor={`r${value}`}
                          title={STAR_LABELS[value]}
                          className="cursor-pointer"
                        >
                          <Star
                            size={28}
                            strokeWidth={1.8}
                            fill={rating >= value ? "currentColor" : "none"}
                            className={
                              rating >= value
                                ? "text-amber-400"
                                : "text-gray-300 hover:text-amber-400"
                            }
                            aria-hidden="true"
                          />

                          <span className="sr-only">{value} স্টার</span>
                        </label>
                      </Fragment>
                    ))}
                  </div>

                  <span className="text-sm font-semibold text-mute">
                    {rating ? STAR_LABELS[rating] : ""}
                  </span>
                </div>
              </fieldset>

              {/* Name */}
              <label className="block">
                <span className="lbl">আপনার নাম *</span>
                <input
                  ref={nameRef}
                  name="name"
                  className="inp"
                  maxLength={40}
                  autoComplete="name"
                  required
                />
              </label>

              {/* Size & Color */}
              <div className="block">
                <span className="lbl">কেনা সাইজ ও রং</span>
                <span className="grid grid-cols-2 gap-2">
                  <span className="select-wrap block">
                    <select
                      name="size"
                      className="inp"
                      aria-label="কেনা সাইজ"
                      defaultValue={verifyState.orderedSize ?? ""}
                    >
                      <option value="">সাইজ</option>
                      {sizeOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span className="select-wrap block">
                    <select
                      name="color"
                      className="inp"
                      aria-label="কেনা রং"
                      defaultValue={verifyState.orderedColor ?? ""}
                    >
                      <option value="">রং</option>
                      {colorOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </span>
                </span>
              </div>

              {/* Fit */}
              <fieldset className="sm:col-span-2">
                <legend className="lbl">ফিট কেমন লেগেছে?</legend>
                <div className="flex flex-wrap gap-2">
                  {(["small", "true", "large"] as const).map((v) => (
                    <label key={v} className="pick">
                      <input type="radio" name="fit" value={v} />
                      <span>
                        {v === "small"
                          ? "একটু ছোট"
                          : v === "true"
                            ? "ঠিকঠাক"
                            : "একটু বড়"}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Title */}
              <label className="block sm:col-span-2">
                <span className="lbl">শিরোনাম *</span>
                <input
                  name="title"
                  className="inp"
                  maxLength={70}
                  placeholder="এক লাইনে আপনার অভিজ্ঞতা"
                  required
                />
              </label>

              {/* Comment */}
              <label className="block sm:col-span-2">
                <span className="flex items-center justify-between">
                  <span className="lbl">বিস্তারিত রিভিউ *</span>
                  <span className="text-xs text-mute mb-2" aria-live="polite">
                    {text.length} / {MAX_TEXT}
                  </span>
                </span>
                <textarea
                  name="text"
                  className="inp"
                  maxLength={MAX_TEXT}
                  placeholder="কাপড়, ফিট, রং, ডেলিভারি — কেমন লেগেছে লিখুন…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </label>

              {/* Photos */}
              <div className="sm:col-span-2">
                <span className="lbl">
                  ছবি যোগ করুন{" "}
                  <span className="font-medium text-mute">
                    (ঐচ্ছিক, সর্বোচ্চ ৩টি)
                  </span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, i) => (
                    <div
                      key={photo.url}
                      className="relative w-20 h-20 overflow-hidden rounded-2xl border border-line bg-soft"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`নির্বাচিত ছবি ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        aria-label={`ছবি ${i + 1} সরান`}
                        className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <label className="w-20 h-20 rounded-2xl border-[1.5px] border-dashed border-line bg-soft grid place-items-center cursor-pointer hover:border-[var(--ink)]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        aria-label="ছবি যোগ করুন"
                        onChange={(e) => {
                          addPhotos(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <svg
                        className="w-6 h-6 text-mute"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </label>
                  )}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <p
                  className="sm:col-span-2 text-sm font-medium text-red-600"
                  role="alert"
                >
                  ⚠ {formError}
                </p>
              )}

              {/* Actions */}
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-2">
                <a
                  href="#reviews"
                  className="h-12 px-6 rounded-2xl border border-line font-semibold hover:bg-soft grid place-items-center"
                >
                  বাতিল
                </a>
                <button
                  type="submit"
                  disabled={isSubmitting || submitState === "pending"}
                  className="h-12 px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting || submitState === "pending" ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                      জমা হচ্ছে…
                    </>
                  ) : (
                    "রিভিউ জমা দিন"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
