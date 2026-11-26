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
import {
  COUNTRIES,
  getCountryByCode,
  getStatesByCountry,
} from "@/data/countries";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Prefill {
  name?: string;
  phone?: string;
  email?: string;
}

interface Props {
  prefill: Prefill | null;
  delivery: DeliverySettings;
  storeCountry: string;
}

const INP = "inp max-sm:!text-base";
const CARD_PAD = "p-4 min-[400px]:p-5 sm:p-7";

// Country options for SearchableSelect
const countryOptions: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  prefix: c.flag,
}));

export default function CheckoutClient({ prefill, delivery, storeCountry }: Props) {
  const router = useRouter();
  const { fmt } = useCurrency();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";

  const { items: cartItems, clearCart } = useCart();

  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Personal info
  const [name, setName] = useState(prefill?.name ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");

  // Address
  const [countryCode, setCountryCode] = useState("BD");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [termsChecked, setTermsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountAmount: number;
    label: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Hydrate items
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

  useEffect(() => {
    if (!isBuyNow && hydrated) setItems(cartItems);
  }, [cartItems, isBuyNow, hydrated]);

  const countryData = getCountryByCode(countryCode);
  const stateOptions: SelectOption[] = getStatesByCountry(countryCode).map((s) => ({
    value: s.name,
    label: s.name,
  }));

  // Reset state/city when country changes
  function handleCountryChange(code: string) {
    setCountryCode(code);
    setState("");
    setCity("");
  }

  function handleStateChange(val: string) {
    setState(val);
  }

  const locationSelected = !!city.trim();
  const isDomestic = locationSelected && countryCode === storeCountry;

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const deliveryCharge = locationSelected
    ? deliveryChargeFor(countryCode, storeCountry, subtotal, delivery)
    : 0;
  const discount = couponApplied?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);
  const freeDeliveryGap = amountToFreeDelivery(subtotal, delivery);
  const displayTotal = locationSelected ? fmt(total) : fmt(subtotal - discount);

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
              ? `${res.value}% off`
              : `${fmt(res.value)} off`,
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
      setError("Please agree to the terms and return policy.");
      return;
    }
    if (!items.length) {
      setError("No items in cart.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrder({
        customer: {
          name,
          phone: phone || undefined,
          email,
          countryCode,
          state: state || undefined,
          city,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          postalCode: postalCode || undefined,
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

      if (paymentMethod === "online" && result.data.orderId && result.data.guestToken) {
        router.push(
          `/payment?orderId=${result.data.orderId}&token=${result.data.guestToken}`,
        );
      } else {
        router.push(`/order-success?order=${result.data.orderNumber}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (hydrated && !items.length) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pb-36 text-center">
        <p className="font-display font-bold text-2xl mb-2">Cart is empty</p>
        <p className="text-[var(--mute)] mb-6">Add items before checking out.</p>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center px-8 rounded-full bg-[var(--ink)] text-[var(--bg)] font-semibold"
        >
          Go to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-10 pb-36 lg:pb-20">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5 sm:mb-8">
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--mute)] hover:text-[var(--ink)] mb-2 sm:mb-3 py-2 -my-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 6 9 12l6 6" />
            </svg>
            Continue Shopping
          </Link>
          <p className="text-xs font-semibold tracking-[.22em] uppercase text-[var(--ink)] mb-1 md:hidden">
            Step 2 / 3
          </p>
          <h1 className="font-display font-extrabold text-[1.85rem] sm:text-4xl lg:text-5xl tracking-tight leading-none">
            Checkout
          </h1>
          <p className="text-[var(--mute)] mt-2 text-[14.5px] sm:text-[15px]">
            Enter your delivery details to confirm the order.
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
                  Delivery Address
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  Where the product will be delivered
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Name */}
              <label className="field block min-w-0">
                <span className="lbl">Full Name *</span>
                <input
                  className={INP}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </label>

              {/* Phone */}
              <label className="field block min-w-0">
                <span className="lbl">
                  Phone Number{" "}
                  <span className="font-medium text-[var(--mute)]">(optional)</span>
                </span>
                <input
                  className={INP}
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 01XXX XXXXXX"
                  autoComplete="tel"
                />
              </label>

              {/* Email */}
              <label className="field block sm:col-span-2 min-w-0">
                <span className="lbl">Email *</span>
                <input
                  type="email"
                  inputMode="email"
                  className={INP}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="email@example.com"
                />
              </label>

              {/* Country */}
              <div className="sm:col-span-2 min-w-0">
                <SearchableSelect
                  label="Country"
                  options={countryOptions}
                  value={countryCode}
                  onChange={handleCountryChange}
                  placeholder="Select country"
                  required
                />
              </div>

              {/* State/Division/Province — only when statesRequired or states list exists */}
              {stateOptions.length > 0 ? (
                <div className="min-w-0">
                  <SearchableSelect
                    label={countryData?.stateLabel ?? "State"}
                    options={stateOptions}
                    value={state}
                    onChange={handleStateChange}
                    placeholder={`Select ${countryData?.stateLabel ?? "State"}`}
                    required={countryData?.statesRequired}
                  />
                </div>
              ) : (
                <label className="field block min-w-0">
                  <span className="lbl">
                    {countryData?.stateLabel ?? "State"}{" "}
                    <span className="font-medium text-[var(--mute)]">(optional)</span>
                  </span>
                  <input
                    className={INP}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder={countryData?.stateLabel ?? "State / Province"}
                    autoComplete="address-level1"
                  />
                </label>
              )}

              {/* City */}
              <label className="field block min-w-0">
                <span className="lbl">{countryData?.cityLabel ?? "City"} *</span>
                <input
                  className={INP}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder={countryData?.cityLabel ?? "City"}
                  autoComplete="address-level2"
                />
              </label>

              {/* Address Line 1 */}
              <label className="field block sm:col-span-2 min-w-0">
                <span className="lbl">Street Address *</span>
                <input
                  className={INP}
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                  placeholder="House / flat no., road, area"
                  autoComplete="address-line1"
                />
              </label>

              {/* Address Line 2 */}
              <label className="field block sm:col-span-2 min-w-0">
                <span className="lbl">
                  Apartment / Suite / Floor{" "}
                  <span className="font-medium text-[var(--mute)]">(optional)</span>
                </span>
                <input
                  className={INP}
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt 4B, Suite 100, Floor 3…"
                  autoComplete="address-line2"
                />
              </label>

              {/* Postal Code */}
              <label className="field block min-w-0">
                <span className="lbl">
                  {countryData?.postalLabel ?? "Postal Code"}{" "}
                  <span className="font-medium text-[var(--mute)]">(optional)</span>
                </span>
                <input
                  className={INP}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={countryData?.postalLabel ?? "Postal Code"}
                  autoComplete="postal-code"
                />
              </label>

              {/* Note */}
              <label className="field block sm:col-span-2 min-w-0">
                <span className="lbl">
                  Order Note{" "}
                  <span className="font-medium text-[var(--mute)]">(optional)</span>
                </span>
                <input
                  className={INP}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Call before delivery, special instructions…"
                />
              </label>
            </div>
          </section>

          {/* Section 2: Delivery Charge */}
          <section className={`card ${CARD_PAD}`}>
            <div className="flex items-start gap-3 mb-5 sm:mb-6">
              <span className="step-no">2</span>
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl leading-tight">
                  Delivery Charge
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  {!locationSelected
                    ? "Enter your city to calculate"
                    : isDomestic
                    ? "Domestic delivery"
                    : "International shipping"}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Domestic card */}
              <div className={`flex items-center gap-3 rounded-2xl p-3.5 sm:p-4 border transition-colors ${
                isDomestic ? "border-[var(--ink)] bg-[var(--soft)]" : "border-[var(--line)]"
              }`}>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  isDomestic ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--line)]"
                }`} />
                <span className="flex-1 min-w-0">
                  <b className="block">Domestic</b>
                  <span className="text-sm text-[var(--mute)]">Same country as store</span>
                </span>
                <b className="font-display shrink-0">{fmt(delivery.domestic)}</b>
              </div>

              {/* International card */}
              <div className={`flex items-center gap-3 rounded-2xl p-3.5 sm:p-4 border transition-colors ${
                locationSelected && !isDomestic ? "border-[var(--ink)] bg-[var(--soft)]" : "border-[var(--line)]"
              }`}>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  locationSelected && !isDomestic ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--line)]"
                }`} />
                <span className="flex-1 min-w-0">
                  <b className="block">International</b>
                  <span className="text-sm text-[var(--mute)]">All other countries</span>
                </span>
                <b className="font-display shrink-0">{fmt(delivery.international)}</b>
              </div>
            </div>

            {!locationSelected && (
              <p className="text-sm text-[var(--mute)] mt-3">
                Select your country and enter your city to see the delivery charge.
              </p>
            )}
          </section>

          {/* Section 3: Payment Method */}
          <section className={`card ${CARD_PAD}`}>
            <div className="flex items-start gap-3 mb-5 sm:mb-6">
              <span className="step-no">3</span>
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl leading-tight">
                  Payment Method
                </h2>
                <p className="text-sm text-[var(--mute)] mt-0.5">
                  COD is free — no payment needed now
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3 rounded-2xl p-3.5 sm:p-4 border cursor-pointer transition-colors ${
                  paymentMethod === "cod"
                    ? "border-[var(--ink)] bg-[var(--soft)]"
                    : "border-[var(--line)] hover:border-[var(--mute)]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4 sm:mt-1 shrink-0 accent-[var(--ink)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 mb-0.5">
                    <b className="block">Cash on Delivery</b>
                  </span>
                  <span className="text-sm text-[var(--mute)]">Pay when you receive the item</span>
                  <span className="block text-xs text-[var(--mute)] mt-0.5">
                    No advance payment required
                  </span>
                </span>
              </label>

              {/* Card Payment (Stripe) */}
              <label
                className={`flex items-start gap-3 rounded-2xl p-3.5 sm:p-4 border cursor-pointer transition-colors ${
                  paymentMethod === "online"
                    ? "border-[var(--ink)] bg-[var(--soft)]"
                    : "border-[var(--line)] hover:border-[var(--mute)]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4 sm:mt-1 shrink-0 accent-[var(--ink)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 mb-0.5">
                    <b className="block">Card Payment</b>
                    {/* Card brand icons */}
                    <span className="flex items-center gap-1 ml-auto">
                      <span className="inline-flex items-center rounded px-1 py-0.5 bg-[#1a1f71] text-white text-[9px] font-bold tracking-tight leading-none">VISA</span>
                      <span className="inline-flex items-center rounded px-1 py-0.5 bg-[var(--soft)] border border-[var(--line)] text-[9px] font-bold tracking-tight leading-none">MC</span>
                    </span>
                  </span>
                  <span className="text-sm text-[var(--mute)]">Credit or debit card</span>
                  <span className="block text-xs text-[var(--mute)] mt-0.5">
                    Secured by Stripe · Pay the full amount now
                  </span>
                </span>
              </label>
            </div>

            {/* Stripe trust line */}
            {paymentMethod === "online" && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--mute)]">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x={3} y={11} width={18} height={11} rx={2} />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Your card details are encrypted and never stored on our servers.
              </p>
            )}
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
                  title: "Fast Delivery",
                  sub: "Domestic & international",
                },
                {
                  icon: <path d="M4 7h16M7 7V5h10v2M6 7l1 13h10l1-13" />,
                  title: "Free Exchange",
                  sub: "Within 7 days",
                },
                {
                  icon: <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" />,
                  title: "Secure Payment",
                  sub: "Powered by Stripe",
                },
              ].map(({ icon, extra, title, sub }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[var(--soft)] grid place-items-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
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
            <h2 className="font-display font-bold text-lg sm:text-xl">Order Summary</h2>
            <span className="text-xs font-semibold tracking-wide uppercase text-[var(--mute)]">
              {items.length > 0
                ? `${items.reduce((s, i) => s + i.quantity, 0)} items`
                : ""}
            </span>
          </div>

          {/* Free shipping progress */}
          {freeDeliveryGap !== null && (
            <div className="mb-4 sm:mb-5 rounded-2xl bg-[var(--soft)] p-3.5">
              <p className="text-sm text-[var(--mute)] mb-2">
                Add {fmt(freeDeliveryGap)} more for free delivery
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

          {delivery.freeDeliveryEnabled && freeDeliveryGap === null && subtotal > 0 && (
            <div className="mb-4 sm:mb-5 rounded-2xl bg-[var(--soft)] p-3.5">
              <p className="text-sm font-semibold">Free delivery! 🎉</p>
            </div>
          )}

          {/* Coupon */}
          <div className="mb-4 sm:mb-5">
            {couponApplied ? (
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--soft)] border border-[var(--ink)] px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <svg className="w-4 h-4 text-[var(--ink)] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-mono truncate">{couponApplied.code}</p>
                    <p className="text-xs text-[var(--mute)]">{couponApplied.label} applied</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="shrink-0 h-10 px-2 -mr-2 text-xs text-[var(--mute)] hover:text-red-500 transition-colors"
                >
                  Remove ✕
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    className={`${INP} flex-1 min-w-0 !rounded-2xl uppercase placeholder:normal-case placeholder:text-[var(--mute)]`}
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                    placeholder="Coupon code"
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
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">⚠ {couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Items list */}
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
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="w-16 h-20 sm:h-16 rounded-xl overflow-hidden bg-[var(--soft)] shrink-0 relative">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight line-clamp-2 sm:truncate">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-[var(--mute)] mt-0.5">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
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
                          <span className="w-8 sm:w-7 text-center text-sm font-semibold">{item.quantity}</span>
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
                          <span className="text-sm font-semibold">{fmt(item.unitPrice * item.quantity)}</span>
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
              <dt className="text-[var(--mute)]">Subtotal</dt>
              <dd className="font-medium">{fmt(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mute)]">Delivery</dt>
              <dd className="font-medium">{locationSelected ? fmt(deliveryCharge) : "—"}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-4 text-green-600">
                <dt className="font-medium">
                  Coupon{" "}
                  <span className="font-mono text-xs font-bold">({couponApplied?.code})</span>
                </dt>
                <dd className="font-semibold shrink-0">−{fmt(discount)}</dd>
              </div>
            )}
            <div className="flex items-end justify-between gap-4 pt-3 border-t border-[var(--line)]">
              <dt className="font-bold">Grand Total</dt>
              <dd className="font-display font-extrabold text-[1.6rem] sm:text-[1.7rem] leading-none">
                {displayTotal}
              </dd>
            </div>
            {paymentMethod === "cod" && (
              <div className="text-xs text-[var(--mute)] bg-[var(--soft)] rounded-xl p-3 mt-1">
                Full amount paid on delivery — no payment needed now.
              </div>
            )}
          </dl>

          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium max-lg:hidden" role="alert">
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
                I have read and agree to the{" "}
                <a href="#" className="underline text-[var(--ink)]">Terms & Conditions</a>{" "}
                and{" "}
                <a href="#" className="underline text-[var(--ink)]">Return Policy</a>.
              </span>
            </label>
            <div className="hidden lg:block">
              <button
                type="submit"
                disabled={submitting || !items.length}
                className="w-full h-[52px] rounded-2xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Processing…" : "Confirm Order"}
              </button>
              <p className="text-xs text-[var(--mute)] text-center mt-3">
                Free size exchange within 7 days
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile sticky bottom bar */}
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--bg)] px-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,.08)]"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {error && (
            <p className="text-xs text-red-600 font-medium mb-2 line-clamp-2" role="alert">
              ⚠ {error}
            </p>
          )}
          <div className="flex items-center gap-3 max-w-6xl mx-auto">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] text-[var(--mute)] leading-none mb-1">Grand Total</p>
              <p className="font-display font-extrabold text-xl leading-none">{displayTotal}</p>
            </div>
            <button
              type="submit"
              disabled={submitting || !items.length}
              className="flex-1 h-12 rounded-2xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-[15px] active:scale-[.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing…" : "Confirm Order"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
