"use client";

import { useTransition, useState, useRef } from "react";
import { addAddress, deleteAddress, setDefaultAddress } from "../actions";
import type { AccountAddress } from "./account.types";

const ADDRESS_TYPES = [
  { value: "home",   label: "বাসা" },
  { value: "office", label: "অফিস" },
  { value: "other",  label: "অন্যান্য" },
];

function AddressCard({
  addr,
  onDelete,
  onSetDefault,
  disabled,
}: {
  addr: AccountAddress;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  disabled: boolean;
}) {
  const typeLabel = ADDRESS_TYPES.find((t) => t.value === addr.label)?.label ?? addr.label;
  return (
    <article
      className={`rounded-2xl p-4 sm:p-5 flex flex-col ${
        addr.isDefault ? "border-2 border-[var(--ink)]" : "border border-line"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`badge ${addr.isDefault ? "solid" : "ghost"}`}>{typeLabel}</span>
        {addr.isDefault && <span className="text-xs font-semibold">ডিফল্ট</span>}
      </div>
      <b>{addr.name}</b>
      <span className="text-sm text-mute">{addr.phone}</span>
      <p className="text-sm mt-2 leading-relaxed flex-1">
        {[addr.address, addr.district, addr.city].filter(Boolean).join(", ")}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-line text-sm font-semibold">
        {!addr.isDefault && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSetDefault(addr._id)}
            className="hover:underline disabled:opacity-50"
          >
            ডিফল্ট করুন
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(addr._id)}
          className="text-mute hover:text-ink hover:underline disabled:opacity-50 ml-auto"
        >
          মুছুন
        </button>
      </div>
    </article>
  );
}

export default function AccountAddresses({ addresses }: { addresses: AccountAddress[] }) {
  const [showForm, setShowForm]   = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addError, setAddError]   = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setAddError("");
    setAddSuccess(false);
    startTransition(async () => {
      const result = await addAddress(formData);
      if (result.success) {
        formRef.current?.reset();
        setAddSuccess(true);
        setShowForm(false);
      } else {
        setAddError(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("এই ঠিকানা মুছে ফেলবেন?")) return;
    startTransition(async () => {
      await deleteAddress(id);
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
    });
  }

  return (
    <section id="addresses" className="card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl">সংরক্ষিত ঠিকানা</h2>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setAddError(""); setAddSuccess(false); }}
          className="h-10 px-4 rounded-xl bg-ink text-bg text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
            <path d={showForm ? "M18 6 6 18M6 6l12 12" : "M12 5v14M5 12h14"} />
          </svg>
          {showForm ? "বাতিল" : "নতুন ঠিকানা"}
        </button>
      </div>

      {addSuccess && (
        <p className="mb-4 text-sm font-medium text-ink flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          ঠিকানা সেভ হয়েছে।
        </p>
      )}

      {/* Existing addresses */}
      {addresses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              addr={addr}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              disabled={isPending}
            />
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="mb-5 text-sm text-mute">এখনো কোনো ঠিকানা সংরক্ষিত নেই।</p>
        )
      )}

      {/* New address form */}
      {showForm && (
        <div className="rounded-2xl border border-line p-4 sm:p-5">
          <h3 className="font-semibold mb-4">নতুন ঠিকানা যোগ করুন</h3>
          <form ref={formRef} onSubmit={handleAdd} noValidate>
            <fieldset className="mb-4">
              <legend className="lbl">ঠিকানার ধরন</legend>
              <div className="flex flex-wrap gap-2">
                {ADDRESS_TYPES.map((t, i) => (
                  <label className="pick" key={t.value}>
                    <input type="radio" name="label" value={t.value} defaultChecked={i === 0} />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="lbl">প্রাপকের নাম *</span>
                <input name="name" className="inp" required minLength={2} maxLength={60} />
              </label>

              <label className="block">
                <span className="lbl">মোবাইল নম্বর *</span>
                <input
                  name="phone"
                  type="tel"
                  className="inp"
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  required
                  pattern="01[3-9][0-9]{8}"
                  maxLength={14}
                />
              </label>

              <label className="block">
                <span className="lbl">জেলা *</span>
                <input name="district" className="inp" placeholder="যেমন: গাজীপুর" required maxLength={80} />
              </label>

              <label className="block">
                <span className="lbl">উপজেলা / এলাকা</span>
                <input name="city" className="inp" placeholder="যেমন: টঙ্গী, বাসাবো" maxLength={80} />
              </label>

              <label className="block sm:col-span-2">
                <span className="lbl">সম্পূর্ণ ঠিকানা *</span>
                <textarea
                  name="address"
                  className="inp"
                  placeholder="বাড়ি নং, রোড, এলাকা"
                  required
                  minLength={5}
                  maxLength={200}
                  rows={3}
                />
              </label>
            </div>

            <label className="flex items-center gap-2.5 mt-4 text-sm cursor-pointer select-none">
              <input name="isDefault" type="checkbox" className="w-4 h-4 accent-[var(--ink)]" />
              ডিফল্ট ঠিকানা হিসেবে সেট করুন
            </label>

            {addError && (
              <p role="alert" className="mt-3 text-sm font-medium">⚠ {addError}</p>
            )}

            <div className="flex justify-end mt-5">
              <button
                type="submit"
                disabled={isPending}
                className="h-12 px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isPending ? "সেভ হচ্ছে…" : "ঠিকানা সেভ করুন"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
