"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";

export interface PaymentMethodInfo {
  id: string;
  name: string;
  type: string;
  number: string;
  color: string;
  instructions: string[];
}

export interface OrderInfo {
  id: string;
  orderNumber: string;
  items: Array<{
    name: string;
    image: string;
    size?: string;
    color?: string;
    quantity: number;
    totalPrice: number;
  }>;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  paymentAmount: number;
  paymentMethod: "cod" | "online";
  customer: {
    name: string;
    district: string;
    upazila?: string;
    address: string;
  };
  payment: {
    status: string;
    gateway?: string;
    transactionId?: string;
    senderAccount?: string;
    screenshotDisplayUrl?: string;
    submittedAt?: string;
    rejectionReason?: string;
  };
}

interface Props {
  order: OrderInfo;
  paymentMethods: PaymentMethodInfo[];
  token: string;
  unconfigured: boolean;
}

function fmt(n: number) {
  return "BDT " + n.toLocaleString("en-US");
}

type SubmitState = "idle" | "uploading" | "submitting" | "success" | "error";

export default function PaymentClient({
  order,
  paymentMethods,
  token,
  unconfigured,
}: Props) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodInfo | null>(
      paymentMethods.length === 1 ? paymentMethods[0] : null,
    );
  const [copied, setCopied] = useState<"number" | "amount" | null>(null);
  const [trxId, setTrxId] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track whether this was already submitted (pending verification or already paid)
  const alreadyProcessing =
    order.payment.status === "processing" || order.payment.status === "paid";
  const wasRejected =
    order.payment.status === "failed" && !!order.payment.gateway;

  const handleCopy = useCallback(
    async (type: "number" | "amount") => {
      if (!selectedMethod) return;
      const text =
        type === "number"
          ? selectedMethod.number
          : order.paymentAmount.toString();
      try {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // fallback: select text
      }
    },
    [selectedMethod, order.paymentAmount],
  );

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setScreenshot(null);
      setPreviewUrl(null);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setFieldErrors((p) => ({
        ...p,
        screenshot: "শুধু JPG, PNG বা WebP ছবি দিন",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((p) => ({
        ...p,
        screenshot: "ছবির আকার সর্বোচ্চ ৫ MB হতে হবে",
      }));
      return;
    }
    setFieldErrors((p) => {
      const n = { ...p };
      delete n.screenshot;
      return n;
    });
    setScreenshot(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!selectedMethod) errors.method = "পেমেন্ট মাধ্যম নির্বাচন করুন";
    if (!trxId.trim()) {
      errors.trxId = "ট্রানজেকশন আইডি প্রয়োজন";
    } else if (trxId.trim().length < 6 || trxId.trim().length > 30) {
      errors.trxId = "ট্রানজেকশন আইডি ৬–৩০ অক্ষরের হতে হবে";
    }
    if (!senderAccount.trim()) {
      errors.senderAccount = "প্রেরকের নম্বর প্রয়োজন";
    } else if (
      !/^01[3-9]\d{8}$/.test(senderAccount.trim().replace(/\s/g, ""))
    ) {
      errors.senderAccount = "বৈধ বাংলাদেশি মোবাইল নম্বর দিন";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitState("submitting");

    try {
      const fd = new FormData();
      fd.append("gateway", selectedMethod!.id);
      fd.append("transactionId", trxId.trim());
      fd.append("senderAccount", senderAccount.trim());
      if (screenshot) fd.append("screenshot", screenshot, screenshot.name);

      const res = await fetch(`/api/orders/${order.id}/payment`, {
        method: "POST",
        headers: { "x-guest-token": token },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
    } catch {
      setSubmitError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
      setSubmitState("error");
    }
  };

  // ── Success State ────────────────────────────────────────────────────────────
  if (submitState === "success") {
    return (
      <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 grid place-items-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-3xl mb-2">
          পেমেন্ট জমা সফল!
        </h1>
        <p className="text-[var(--mute)] mb-1">
          অর্ডার নম্বর:{" "}
          <span className="font-bold text-[var(--ink)]">
            {order.orderNumber}
          </span>
        </p>
        <p className="text-[var(--mute)] mb-8">
          আপনার পেমেন্ট তথ্য যাচাইয়ের জন্য পাঠানো হয়েছে। যাচাই হলে SMS-এ
          কনফার্মেশন পাবেন।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center px-8 rounded-full border border-[var(--line)] font-semibold hover:bg-[var(--soft)] transition-colors"
          >
            হোমে যান
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center px-8 rounded-full bg-[var(--ink)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity"
          >
            শপিং চালিয়ে যান
          </Link>
        </div>
      </main>
    );
  }

  // ── Already Submitted (processing or paid) ──────────────────────────────────
  if (alreadyProcessing) {
    const isPaid = order.payment.status === "paid";
    return (
      <main className="max-w-lg mx-auto px-4 pt-20 pb-32 text-center">
        <div
          className={`w-20 h-20 rounded-full ${isPaid ? "bg-green-100" : "bg-amber-100"} grid place-items-center mx-auto mb-6`}
        >
          {isPaid ? (
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-amber-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx={12} cy={12} r={9} />
              <path d="M12 7v5M12 16h.01" />
            </svg>
          )}
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-2">
          {isPaid ? "পেমেন্ট যাচাই হয়েছে!" : "পেমেন্ট যাচাইয়ের অপেক্ষায়"}
        </h1>
        <p className="text-[var(--mute)] mb-1">
          অর্ডার নম্বর:{" "}
          <span className="font-bold text-[var(--ink)]">
            {order.orderNumber}
          </span>
        </p>
        {!isPaid && (
          <p className="text-[var(--mute)] mb-8">
            আপনার পেমেন্ট তথ্য পর্যালোচনা করা হচ্ছে। যাচাই হলে SMS-এ কনফার্মেশন
            পাবেন।
          </p>
        )}
        {isPaid && (
          <p className="text-[var(--mute)] mb-8">
            আপনার পেমেন্ট যাচাই হয়েছে। অর্ডারটি প্রক্রিয়াধীন।
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center px-8 rounded-full border border-[var(--line)] font-semibold hover:bg-[var(--soft)] transition-colors"
          >
            হোমে যান
          </Link>
        </div>
      </main>
    );
  }

  const busy = submitState === "submitting";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-36 lg:pb-20">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--mute)] hover:text-[var(--ink)] mb-3"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M15 6 9 12l6 6" />
          </svg>
          চেকআউটে ফিরে যান
        </Link>
        <p className="text-xs font-semibold tracking-[.22em] uppercase text-[var(--mute)] mb-1 md:hidden">
          ধাপ ৩ / ৩
        </p>
        <h1 className="font-display font-extrabold text-[2rem] sm:text-4xl lg:text-5xl tracking-tight leading-none">
          পেমেন্ট
        </h1>
        <p className="text-[var(--mute)] mt-2 text-[15px]">
          {order.paymentMethod === "cod"
            ? "অগ্রিম ডেলিভারি চার্জ মোবাইল ব্যাংকিং-এ পরিশোধ করুন।"
            : "মোবাইল ব্যাংকিং-এ টাকা পাঠিয়ে ট্রানজেকশন আইডি দিন।"}
        </p>
        {order.paymentMethod === "cod" && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-sm">
            <svg
              className="w-4 h-4 text-[var(--ink)] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx={12} cy={12} r={9} />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <span>
              পণ্যের দাম ডেলিভারিম্যানকে দিন — এখন শুধু ডেলিভারি চার্জ{" "}
              <b className="text-[var(--ink)]">{fmt(order.paymentAmount)}</b>{" "}
              পরিশোধ করুন।
            </span>
          </div>
        )}
      </div>

      {/* Setup warning */}
      {unconfigured && (
        <div className="mb-5 rounded-2xl border-2 border-[var(--ink)] p-4 text-sm font-medium">
          ⚠ সাইট মালিকের জন্য: অ্যাডমিন প্যানেলের{" "}
          <b>Settings → Payment Numbers</b> থেকে bKash / Nagad / Rocket নম্বর যোগ
          করুন।
        </div>
      )}

      {/* Rejection notice */}
      {wasRejected && order.payment.rejectionReason && (
        <div className="mb-5 rounded-2xl border-2 border-red-400 bg-red-50 p-4 text-sm">
          <p className="font-semibold text-red-800 mb-1">
            পেমেন্ট প্রত্যাখ্যান হয়েছে
          </p>
          <p className="text-red-700">কারণ: {order.payment.rejectionReason}</p>
          <p className="text-red-600 mt-1">
            নিচে নতুন তথ্য দিয়ে আবার জমা দিন।
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start"
      >
        <div className="space-y-5">
          {/* Step 1: Choose method */}
          <section className="card p-5 sm:p-7">
            <div className="flex items-start gap-3 mb-6">
              <span className="step-no">1</span>
              <div>
                <h2 className="font-display font-bold text-xl leading-tight">
                  পেমেন্ট মাধ্যম বাছাই করুন
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  যেকোনো একটি থেকে Send Money করুন
                </p>
              </div>
            </div>

            {paymentMethods.length === 0 ? (
              <p className="text-sm text-[var(--mute)]">
                কোনো পেমেন্ট পদ্ধতি কনফিগার করা হয়নি।
              </p>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                role="radiogroup"
                aria-label="পেমেন্ট মাধ্যম"
              >
                {paymentMethods.map((m) => {
                  const active = selectedMethod?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedMethod(m)}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                        active
                          ? "border-[var(--ink)] bg-[var(--soft)]"
                          : "border-[var(--line)] hover:border-[var(--mute)]"
                      }`}
                    >
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.name[0]}
                      </span>
                      <span className="font-semibold text-sm">{m.name}</span>
                      {active && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--ink)] flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-[var(--bg)]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {fieldErrors.method && (
              <p className="mt-3 text-sm text-red-600">{fieldErrors.method}</p>
            )}
          </section>

          {/* Step 2: Instructions */}
          <section className="card p-5 sm:p-7">
            <div className="flex items-start gap-3 mb-6">
              <span className="step-no">2</span>
              <div>
                <h2 className="font-display font-bold text-xl leading-tight">
                  {selectedMethod
                    ? `${selectedMethod.name}-এ টাকা পাঠান`
                    : "পেমেন্ট নির্দেশনা"}
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  নিচের নম্বরে ঠিক এই পরিমাণ টাকা পাঠান
                </p>
              </div>
            </div>

            {!selectedMethod ? (
              <p className="text-sm text-[var(--mute)]">
                উপরে পেমেন্ট মাধ্যম বাছাই করুন।
              </p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <div className="rounded-2xl bg-[var(--soft)] p-4">
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--mute)] mb-1.5">
                      {selectedMethod.type} নম্বর
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <b className="font-display font-extrabold text-xl sm:text-2xl tracking-wide">
                        {selectedMethod.number}
                      </b>
                      <button
                        type="button"
                        onClick={() => handleCopy("number")}
                        className="shrink-0 h-8 px-3 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--soft)] transition-colors"
                      >
                        {copied === "number" ? "✓ কপি" : "কপি"}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[var(--soft)] p-4">
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--mute)] mb-1.5">
                      {order.paymentMethod === "cod"
                        ? "অগ্রিম ডেলিভারি চার্জ"
                        : "পাঠানোর পরিমাণ"}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <b className="font-display font-extrabold text-xl sm:text-2xl">
                        {fmt(order.paymentAmount)}
                      </b>
                      <button
                        type="button"
                        onClick={() => handleCopy("amount")}
                        className="shrink-0 h-8 px-3 rounded-xl border border-[var(--line)] text-xs font-semibold hover:bg-[var(--soft)] transition-colors"
                      >
                        {copied === "amount" ? "✓ কপি" : "কপি"}
                      </button>
                    </div>
                  </div>
                </div>

                <ol className="space-y-3 text-[15px] mb-6">
                  {selectedMethod.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--soft)] border border-[var(--line)] flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-[var(--mute)] flex gap-3">
                  <svg
                    className="w-5 h-5 shrink-0 text-[var(--ink)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <circle cx={12} cy={12} r={9} />
                    <path d="M12 8v5M12 16h.01" />
                  </svg>
                  <span>
                    অবশ্যই <b className="text-[var(--ink)]">Send Money</b>{" "}
                    করবেন, Cash Out বা Payment নয়। ভুল নম্বরে বা ভুল পরিমাণ
                    পাঠালে অর্ডার কনফার্ম হতে দেরি হবে।
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Step 3: Payment info */}
          <section className="card p-5 sm:p-7">
            <div className="flex items-start gap-3 mb-6">
              <span className="step-no">3</span>
              <div>
                <h2 className="font-display font-bold text-xl leading-tight">
                  পেমেন্ট তথ্য দিন
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  টাকা পাঠানোর পর SMS-এ পাওয়া তথ্য লিখুন
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="lbl">যে নম্বর থেকে পাঠিয়েছেন *</span>
                <input
                  className={`inp ${fieldErrors.senderAccount ? "border-red-400" : ""}`}
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel-national"
                  maxLength={14}
                  value={senderAccount}
                  onChange={(e) => {
                    setSenderAccount(e.target.value);
                    setFieldErrors((p) => {
                      const n = { ...p };
                      delete n.senderAccount;
                      return n;
                    });
                  }}
                />
                {fieldErrors.senderAccount && (
                  <span className="text-xs text-red-600 mt-1 block">
                    {fieldErrors.senderAccount}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="lbl">ট্রানজেকশন আইডি (TrxID) *</span>
                <input
                  className={`inp font-mono ${fieldErrors.trxId ? "border-red-400" : ""}`}
                  placeholder="যেমন: 9GH7K2L3MN"
                  autoComplete="off"
                  maxLength={30}
                  spellCheck={false}
                  value={trxId}
                  onChange={(e) => {
                    setTrxId(e.target.value);
                    setFieldErrors((p) => {
                      const n = { ...p };
                      delete n.trxId;
                      return n;
                    });
                  }}
                />
                {fieldErrors.trxId && (
                  <span className="text-xs text-red-600 mt-1 block">
                    {fieldErrors.trxId}
                  </span>
                )}
              </label>

              {/* Screenshot upload */}
              <div className="sm:col-span-2">
                <span className="lbl">
                  পেমেন্টের স্ক্রিনশট{" "}
                  <span className="font-medium text-[var(--mute)]">
                    (ঐচ্ছিক)
                  </span>
                </span>
                <label
                  className="drop flex items-center gap-4 p-4 cursor-pointer rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--soft)] transition-colors"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-[var(--ink)]");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("border-[var(--ink)]");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-[var(--ink)]");
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileChange(file);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] ?? null)
                    }
                  />
                  <span className="w-14 h-14 rounded-xl bg-[var(--soft)] border border-[var(--line)] grid place-items-center shrink-0 overflow-hidden">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="preview"
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-[var(--mute)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <rect x={3} y={5} width={18} height={14} rx={2} />
                        <circle cx={9} cy={10} r="1.6" />
                        <path d="m21 16-5-5-8 8" />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-sm truncate">
                      {screenshot ? screenshot.name : "ছবি আপলোড করুন"}
                    </b>
                    <span className="text-xs text-[var(--mute)]">
                      {screenshot
                        ? `${(screenshot.size / 1024).toFixed(0)} KB`
                        : "PNG বা JPG, সর্বোচ্চ ৫ MB"}
                    </span>
                  </span>
                  {screenshot && (
                    <button
                      type="button"
                      className="text-xs text-[var(--mute)] hover:text-red-600 underline shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        setScreenshot(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      সরান
                    </button>
                  )}
                </label>
                {fieldErrors.screenshot && (
                  <span className="text-xs text-red-600 mt-1 block">
                    {fieldErrors.screenshot}
                  </span>
                )}
              </div>
            </div>

            {submitError && (
              <p className="mt-4 text-sm font-medium text-red-600" role="alert">
                ⚠ {submitError}
              </p>
            )}
          </section>
        </div>

        {/* Order Summary sidebar */}
        <aside className="lg:sticky lg:top-24 card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display font-bold text-xl">অর্ডার সামারি</h2>
            <span className="text-xs font-semibold tracking-wide text-[var(--mute)]">
              {order.orderNumber}
            </span>
          </div>

          <div className="summary-scroll space-y-3.5 pr-1 max-h-56 overflow-y-auto">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--soft)] shrink-0 relative">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">
                    {item.name}
                  </p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-[var(--mute)]">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-[var(--mute)] mt-0.5">
                    × {item.quantity} = {fmt(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-[var(--soft)] p-3 text-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--mute)] mb-1">
              ডেলিভারি
            </p>
            <p className="leading-snug">
              {order.customer.district}
              {order.customer.upazila ? `, ${order.customer.upazila}` : ""}
            </p>
            <p className="text-xs text-[var(--mute)] truncate">
              {order.customer.address}
            </p>
          </div>

          <dl className="mt-4 pt-4 border-t border-[var(--line)] space-y-2.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mute)]">সাবটোটাল</dt>
              <dd className="font-medium">{fmt(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--mute)]">কুপন ছাড়</dt>
                <dd className="font-medium text-green-700">
                  −{fmt(order.discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mute)]">ডেলিভারি</dt>
              <dd className="font-medium">{fmt(order.deliveryCharge)}</dd>
            </div>
            <div className="flex items-end justify-between gap-4 pt-3 border-t border-[var(--line)]">
              <dt className="font-bold">পরিশোধযোগ্য</dt>
              <dd className="font-display font-extrabold text-[1.7rem] leading-none">
                {fmt(order.paymentAmount)}
              </dd>
            </div>
          </dl>

          {/* Submit bar */}
          <div className="mt-5">
            <button
              type="submit"
              disabled={busy || paymentMethods.length === 0}
              className="w-full h-[52px] rounded-2xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx={12}
                      cy={12}
                      r={10}
                      stroke="currentColor"
                      strokeWidth={4}
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  জমা দেওয়া হচ্ছে…
                </>
              ) : (
                "পেমেন্ট সাবমিট করুন"
              )}
            </button>
            <p className="text-xs text-[var(--mute)] text-center mt-3">
              পেমেন্ট যাচাই হলে SMS-এ কনফার্মেশন পাবেন
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}
