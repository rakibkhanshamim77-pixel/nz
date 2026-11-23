"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartProvider";
import { type CartItem, readBuyNow, clearBuyNow } from "@/lib/cart";
import { placeOrder } from "@/db/actions/order.action";
import { validateCoupon } from "@/db/actions/validateCoupon";
import {
  amountToFreeDelivery,
  deliveryChargeFor,
  type DeliverySettings,
} from "@/db/settings";
import LocationDropdown, { type LocationOption } from "./LocationDropdown";
import {
  divisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
} from "@/data/bd-locations";

interface Prefill {
  name?: string;
  phone?: string;
  email?: string;
}

interface Props {
  prefill: Prefill | null;
  delivery: DeliverySettings;
}

function fmt(n: number) {
  return "৳" + n.toLocaleString("bn-BD");
}

// MOBILE: 16px text on phones stops iOS Safari from zooming the page when an input is focused
const INP = "inp max-sm:!text-base";
// MOBILE: slightly tighter card padding on very small screens (<400px)
const CARD_PAD = "p-4 min-[400px]:p-5 sm:p-7";

export default function CheckoutClient({ prefill, delivery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";

  const { items: cartItems, clearCart } = useCart();

  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Form state
  const [name, setName] = useState(prefill?.name ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");

  // Location
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [upazilaId, setUpazilaId] = useState<number | null>(null);

  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [termsChecked, setTermsChecked] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountAmount: number;
    label: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Hydrate items from cart or buyNow
  useEffect(() => {
    if (isBuyNow) {
      const item = readBuyNow();
      setItems(item ? [item] : []);
    } else {
      setItems(cartItems);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuyNow]);

  // Sync cart items (non-buynow mode)
  useEffect(() => {
    if (!isBuyNow && hydrated) setItems(cartItems);
  }, [cartItems, isBuyNow, hydrated]);

  // Cascading reset
  function handleDivisionChange(id: number | null) {
    setDivisionId(id);
    setDistrictId(null);
    setUpazilaId(null);
  }

  function handleDistrictChange(id: number | null) {
    setDistrictId(id);
    setUpazilaId(null);
  }

  // Derived option lists
  const divisionOptions: LocationOption[] = divisions.map((d) => ({
    id: d.id,
    name_bn: d.name_bn,
    name_en: d.name_en,
  }));

  const districtOptions: LocationOption[] = divisionId
    ? getDistrictsByDivision(divisionId).map((d) => ({
        id: d.id,
        name_bn: d.name_bn,
        name_en: d.name_en,
      }))
    : [];

  const upazilaOptions: LocationOption[] = districtId
    ? getUpazilasByDistrict(districtId).map((u) => ({
        id: u.id,
        name_bn: u.name_bn,
        name_en: u.name_en,
      }))
    : [];

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  // Same helper placeOrder uses, so this never disagrees with the saved order
  const deliveryCharge = deliveryChargeFor(districtId, subtotal, delivery);
  const discount = couponApplied?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);
  const freeDeliveryGap = amountToFreeDelivery(subtotal, delivery);
  const displayTotal = districtId ? fmt(total) : fmt(subtotal - discount);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponInput.trim(), subtotal);
      if (!res.ok) {
        setCouponError(res.error);
        setCouponApplied(null);
      } else {
        setCouponApplied({
          code: res.code,
          discountAmount: res.discountAmount,
          label:
            res.type === "percentage"
              ? `${res.value}% ছাড়`
              : `৳${res.value} ছাড়`,
        });
        setCouponError("");
        setCouponInput("");
      }
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponError("");
    setCouponInput("");
  }

  const updateQty = (item: CartItem, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
          ? { ...i, quantity: Math.max(1, Math.min(20, qty)) }
          : i,
      ),
    );
  };

  const removeItem = (item: CartItem) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
          ),
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsChecked) {
      setError("শর্তাবলী ও রিটার্ন পলিসিতে সম্মত হন।");
      return;
    }
    if (!divisionId) {
      setError("বিভাগ নির্বাচন করুন।");
      return;
    }
    if (!districtId) {
      setError("জেলা নির্বাচন করুন।");
      return;
    }
    if (!items.length) {
      setError("কার্টে কোনো পণ্য নেই।");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrder({
        customer: {
          name,
          phone,
          email,
          divisionId,
          districtId,
          upazilaId: upazilaId ?? undefined,
          address,
        },
        note,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          colorHex: i.colorHex,
          quantity: i.quantity,
        })),
        mode: isBuyNow ? "buynow" : "cart",
        couponCode: couponApplied?.code,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (isBuyNow) clearBuyNow();
      else clearCart();

      if (result.data.orderId && result.data.guestToken) {
        router.push(
          `/payment?orderId=${result.data.orderId}&token=${result.data.guestToken}`,
        );
      } else {
        router.push(`/order-success?order=${result.data.orderNumber}`);
      }
    } catch {
      setError("কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  if (hydrated && !items.length) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pb-36 text-center">
        <p className="font-display font-bold text-2xl mb-2">কার্ট খালি</p>
        <p className="text-[var(--mute)] mb-6">
          চেকআউট করতে আগে পণ্য যোগ করুন।
        </p>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center px-8 rounded-full bg-[var(--ink)] text-[var(--bg)] font-semibold"
        >
          শপে যান
        </Link>
      </main>
    );
  }

  return (
    // MOBILE: pb-36 leaves room for the sticky bottom bar below (hidden on lg+)
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-10 pb-36 lg:pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5 sm:mb-8">
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--mute)] hover:text-[var(--ink)] mb-2 sm:mb-3 py-2 -my-1"
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
            শপিং চালিয়ে যান
          </Link>
          <p className="text-xs font-semibold tracking-[.22em] uppercase text-[var(--ink)] mb-1 md:hidden">
            ধাপ ২ / ৩
          </p>
          <h1 className="font-display font-extrabold text-[1.85rem] sm:text-4xl lg:text-5xl tracking-tight leading-none">
            চেকআউট
          </h1>
          <p className="text-[var(--mute)] mt-2 text-[14.5px] sm:text-[15px]">
            ডেলিভারি তথ্য দিয়ে অর্ডারটি কনফার্ম করুন।
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 sm:gap-6 lg:gap-8 items-start"
      >
        {/* Left column */}
        <div className="space-y-4 sm:space-y-5 min-w-0">
          {/* Section 1: Delivery Address */}
          <section className={`card ${CARD_PAD}`}>
            <div className="flex items-start gap-3 mb-5 sm:mb-6">
              <span className="step-no">1</span>
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl leading-tight">
                  ডেলিভারি ঠিকানা
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  যে ঠিকানায় পণ্য পৌঁছাবে
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Name */}
              <label className="field block min-w-0">
                <span className="lbl">পুরো নাম *</span>
                <input
                  className={INP}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="আপনার নাম"
                />
              </label>
              {/* Phone */}
              <label className="field block min-w-0">
                <span className="lbl">মোবাইল নম্বর *</span>
                <input
                  className={INP}
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                />
              </label>
              {/* Email */}
              <label className="field block sm:col-span-2 min-w-0">
                <span className="lbl">
                  ইমেইল{" "}
                  <span className="font-medium text-[var(--mute)]">
                    (ঐচ্ছিক)
                  </span>
                </span>
                <input
                  type="email"
                  inputMode="email"
                  className={INP}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="email@example.com"
                />
              </label>

              {/* Division / District / Upazila */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
                <LocationDropdown
                  label="বিভাগ"
                  placeholder="বিভাগ নির্বাচন করুন"
                  options={divisionOptions}
                  value={divisionId}
                  onChange={handleDivisionChange}
                  required
                />
                <LocationDropdown
                  label="জেলা"
                  placeholder={
                    divisionId
                      ? "জেলা নির্বাচন করুন"
                      : "আগে বিভাগ নির্বাচন করুন"
                  }
                  options={districtOptions}
                  value={districtId}
                  onChange={handleDistrictChange}
                  disabled={!divisionId}
                  required
                />
                <LocationDropdown
                  label="উপজেলা / থানা"
                  placeholder={
                    districtId
                      ? "উপজেলা নির্বাচন করুন"
                      : "আগে জেলা নির্বাচন করুন"
                  }
                  options={upazilaOptions}
                  value={upazilaId}
                  onChange={setUpazilaId}
                  disabled={!districtId}
                />
              </div>

              {/* Address */}
              <label className="field block sm:col-span-2 min-w-0">
                <span className="lbl">সম্পূর্ণ ঠিকানা *</span>
                <textarea
                  rows={3}
                  className={INP}
                  style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="বাড়ি নং, রোড, এলাকা"
                />
              </label>
              {/* Note */}
              <label className="field block sm:col-span-2 min-w-0">
                <span className="lbl">
                  অর্ডার নোট{" "}
                  <span className="font-medium text-[var(--mute)]">
                    (ঐচ্ছিক)
                  </span>
                </span>
                <input
                  className={INP}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ডেলিভারির আগে কল করুন…"
                />
              </label>
            </div>
          </section>

          {/* Section 2: Delivery Method */}
          <section className={`card ${CARD_PAD}`}>
            <div className="flex items-start gap-3 mb-5 sm:mb-6">
              <span className="step-no">2</span>
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl leading-tight">
                  ডেলিভারি চার্জ
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  জেলা অনুযায়ী স্বয়ংক্রিয়ভাবে নির্ধারিত
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "ঢাকা", desc: "১–২ কার্যদিবস", charge: 60 },
                { label: "ঢাকার বাইরে", desc: "২–৪ কার্যদিবস", charge: 120 },
              ].map((opt) => {
                const active =
                  opt.charge === deliveryCharge && districtId !== null;
                return (
                  <div
                    key={opt.charge}
                    className={`flex items-center gap-3 rounded-2xl p-3.5 sm:p-4 border transition-colors ${
                      active
                        ? "border-[var(--ink)] bg-[var(--soft)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        active
                          ? "border-[var(--ink)] bg-[var(--ink)]"
                          : "border-[var(--line)]"
                      }`}
                    />
                    <span className="flex-1 min-w-0">
                      <b className="block">{opt.label}</b>
                      <span className="text-sm text-[var(--mute)]">
                        {opt.desc}
                      </span>
                    </span>
                    <b className="font-display shrink-0">{fmt(opt.charge)}</b>
                  </div>
                );
              })}
            </div>
            {!districtId && (
              <p className="text-sm text-[var(--mute)] mt-3">
                জেলা নির্বাচন করলে ডেলিভারি চার্জ দেখাবে।
              </p>
            )}
          </section>

          {/* Section 3: Payment Method */}
          <section className={`card ${CARD_PAD}`}>
            <div className="flex items-start gap-3 mb-5 sm:mb-6">
              <span className="step-no">3</span>
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl leading-tight">
                  পেমেন্ট পদ্ধতি
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  COD তে শুধু ডেলিভারি চার্জ অনলাইনে দিন
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  value: "cod" as const,
                  label: "ক্যাশ অন ডেলিভারি",
                  desc: "পণ্য পেলে টাকা দিন",
                  note: "শুধু ডেলিভারি চার্জ অগ্রিম",
                },
                {
                  value: "online" as const,
                  label: "মোবাইল ব্যাংকিং",
                  desc: "bKash / Nagad / Rocket",
                  note: "সম্পূর্ণ টাকা এখনই পরিশোধ করুন",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-2xl p-3.5 sm:p-4 border cursor-pointer transition-colors ${
                    paymentMethod === opt.value
                      ? "border-[var(--ink)] bg-[var(--soft)]"
                      : "border-[var(--line)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4 sm:mt-1 shrink-0 accent-[var(--ink)]"
                  />
                  <span className="min-w-0">
                    <b className="block">{opt.label}</b>
                    <span className="text-sm text-[var(--mute)]">
                      {opt.desc}
                    </span>
                    {opt.note && (
                      <span className="block text-xs text-[var(--mute)] mt-0.5">
                        {opt.note}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Trust badges */}
          <section className="card p-4 min-[400px]:p-5 sm:p-6">
            <div className="grid sm:grid-cols-3 gap-3.5 sm:gap-4 text-sm">
              {[
                {
                  icon: <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />,
                  extra: (
                    <>
                      <circle cx={7} cy={18} r="1.6" />
                      <circle cx={18} cy={18} r="1.6" />
                    </>
                  ),
                  title: "দ্রুত ডেলিভারি",
                  sub: "ঢাকায় ১–২ দিন",
                },
                {
                  icon: <path d="M4 7h16M7 7V5h10v2M6 7l1 13h10l1-13" />,
                  title: "ফ্রি এক্সচেঞ্জ",
                  sub: "৭ দিনের মধ্যে",
                },
                {
                  icon: (
                    <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" />
                  ),
                  title: "নিরাপদ পেমেন্ট",
                  sub: "এনক্রিপ্টেড",
                },
              ].map(({ icon, extra, title, sub }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[var(--soft)] grid place-items-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      {icon}
                      {extra}
                    </svg>
                  </span>
                  <span>
                    <b className="block">{title}</b>
                    <span className="text-[var(--mute)]">{sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column: Order Summary */}
        <aside className="lg:sticky lg:top-24 card p-4 min-[400px]:p-5 sm:p-6 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
            <h2 className="font-display font-bold text-lg sm:text-xl">
              অর্ডার সামারি
            </h2>
            <span className="text-xs font-semibold tracking-wide uppercase text-[var(--mute)]">
              {items.length > 0
                ? `${items.reduce((s, i) => s + i.quantity, 0)} টি পণ্য`
                : ""}
            </span>
          </div>

          {/* Free shipping progress — only when free delivery is actually switched on */}
          {freeDeliveryGap !== null && (
            <div className="mb-4 sm:mb-5 rounded-2xl bg-[var(--soft)] p-3.5">
              <p className="text-sm text-[var(--mute)] mb-2">
                আর {fmt(freeDeliveryGap)} কিনলে ডেলিভারি ফ্রি
              </p>
              <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
                <div
                  className="h-full bg-[var(--ink)] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (subtotal / delivery.freeDeliveryThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {delivery.freeDeliveryEnabled &&
            freeDeliveryGap === null &&
            subtotal > 0 && (
              <div className="mb-4 sm:mb-5 rounded-2xl bg-[var(--soft)] p-3.5">
                <p className="text-sm font-semibold">ডেলিভারি ফ্রি! 🎉</p>
              </div>
            )}

          {/* Coupon input */}
          <div className="mb-4 sm:mb-5">
            {couponApplied ? (
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--soft)] border border-[var(--ink)] px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <svg
                    className="w-4 h-4 text-[var(--ink)] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-mono truncate">
                      {couponApplied.code}
                    </p>
                    <p className="text-xs text-[var(--mute)]">
                      {couponApplied.label} প্রযোজ্য
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="shrink-0 h-10 px-2 -mr-2 text-xs text-[var(--mute)] hover:text-red-500 transition-colors"
                >
                  সরান ✕
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    className={`${INP} flex-1 min-w-0 !rounded-2xl uppercase placeholder:normal-case placeholder:text-[var(--mute)]`}
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), applyCoupon())
                    }
                    placeholder="কুপন কোড"
                    disabled={couponLoading}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="shrink-0 h-12 px-4 rounded-2xl bg-[var(--ink)] text-[var(--bg)] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                  >
                    {couponLoading ? "…" : "প্রয়োগ"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    ⚠ {couponError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Items list — MOBILE: no inner scroll box (page scrolls instead); lg+ keeps the capped height */}
          <div className="space-y-4 lg:max-h-72 lg:overflow-y-auto lg:pr-1 mb-4">
            {!hydrated
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-16 h-16 rounded-xl bg-[var(--soft)] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[var(--soft)] rounded w-3/4" />
                      <div className="h-3 bg-[var(--soft)] rounded w-1/2" />
                    </div>
                  </div>
                ))
              : items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3"
                  >
                    <div className="w-16 h-20 sm:h-16 rounded-xl overflow-hidden bg-[var(--soft)] shrink-0 relative">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight line-clamp-2 sm:truncate">
                        {item.name}
                      </p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-[var(--mute)] mt-0.5">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {/* MOBILE: wraps instead of overflowing; bigger tap targets */}
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 mt-2 sm:mt-1.5">
                        <div className="flex items-center border border-[var(--line)] rounded-xl sm:rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQty(item, item.quantity - 1)}
                            className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-[var(--soft)] active:bg-[var(--soft)]"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 sm:w-7 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item, item.quantity + 1)}
                            className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-[var(--soft)] active:bg-[var(--soft)]"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                          <span className="text-sm font-semibold">
                            {fmt(item.unitPrice * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            className="w-9 h-9 sm:w-auto sm:h-auto -mr-2 sm:mr-0 grid place-items-center text-[var(--mute)] hover:text-red-500 text-xs"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Totals */}
          <dl className="pt-4 border-t border-[var(--line)] space-y-2.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mute)]">সাবটোটাল</dt>
              <dd className="font-medium">{fmt(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mute)]">ডেলিভারি</dt>
              <dd className="font-medium">
                {districtId ? fmt(deliveryCharge) : "—"}
              </dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-4 text-green-600">
                <dt className="font-medium">
                  কুপন ছাড়{" "}
                  <span className="font-mono text-xs font-bold">
                    ({couponApplied?.code})
                  </span>
                </dt>
                <dd className="font-semibold shrink-0">−{fmt(discount)}</dd>
              </div>
            )}
            <div className="flex items-end justify-between gap-4 pt-3 border-t border-[var(--line)]">
              <dt className="font-bold">সর্বমোট</dt>
              <dd className="font-display font-extrabold text-[1.6rem] sm:text-[1.7rem] leading-none">
                {displayTotal}
              </dd>
            </div>
            {paymentMethod === "cod" && districtId && (
              <div className="text-xs text-[var(--mute)] bg-[var(--soft)] rounded-xl p-3 mt-1">
                এখন অনলাইনে পরিশোধ:{" "}
                <b className="text-[var(--ink)]">{fmt(deliveryCharge)}</b>
                <br />
                ডেলিভারিতে দিন:{" "}
                <b className="text-[var(--ink)]">
                  {fmt(Math.max(0, subtotal - discount))}
                </b>
              </div>
            )}
          </dl>

          {/* Error — MOBILE: shown in the sticky bar instead */}
          {error && (
            <p
              className="mt-4 text-sm text-red-600 font-medium max-lg:hidden"
              role="alert"
            >
              ⚠ {error}
            </p>
          )}

          {/* Terms + Submit */}
          <div className="mt-5">
            <label className="flex items-start gap-3 lg:mb-4 text-sm text-[var(--mute)] cursor-pointer py-1">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4 shrink-0 accent-[var(--ink)]"
              />
              <span>
                আমি{" "}
                <a href="#" className="underline text-[var(--ink)]">
                  শর্তাবলী
                </a>{" "}
                ও{" "}
                <a href="#" className="underline text-[var(--ink)]">
                  রিটার্ন পলিসি
                </a>{" "}
                পড়েছি ও সম্মত।
              </span>
            </label>
            {/* Desktop submit (mobile uses the sticky bar) */}
            <div className="hidden lg:block">
              <button
                type="submit"
                disabled={submitting || !items.length}
                className="w-full h-[52px] rounded-2xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "প্রক্রিয়া করা হচ্ছে…" : "অর্ডার কনফার্ম করুন"}
              </button>
              <p className="text-xs text-[var(--mute)] text-center mt-3">
                ৭ দিনের মধ্যে ফ্রি সাইজ এক্সচেঞ্জ
              </p>
            </div>
          </div>
        </aside>

        {/* MOBILE: sticky bottom bar — total + confirm always reachable */}
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--bg)] px-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,.08)]"
          style={{
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {error && (
            <p
              className="text-xs text-red-600 font-medium mb-2 line-clamp-2"
              role="alert"
            >
              ⚠ {error}
            </p>
          )}
          <div className="flex items-center gap-3 max-w-6xl mx-auto">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] text-[var(--mute)] leading-none mb-1">
                সর্বমোট
              </p>
              <p className="font-display font-extrabold text-xl leading-none">
                {displayTotal}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || !items.length}
              className="flex-1 h-12 rounded-2xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-[15px] active:scale-[.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "প্রক্রিয়া করা হচ্ছে…" : "অর্ডার কনফার্ম করুন"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
