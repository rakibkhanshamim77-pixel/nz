"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { updateSettings } from "@/db/actions/admin/settings.admin.action";
import {
  validateSettings,
  type SettingsFieldErrors,
  type SettingsFieldKey,
} from "@/db/validation/settings.validation";
import type {
  DeliverySettings,
  InventorySettings,
  PaymentWallet,
  StoreConfig,
  StoreSettings,
  WalletId,
} from "@/db/settings";
import { useUnsavedChangesGuard } from "../../products/_components/form/useUnsavedChangesGuard";
import DiscardDialog from "../../products/_components/form/DiscardDialog";
import SettingsDelivery from "./SettingsDelivery";
import SettingsInventory from "./SettingsInventory";
import SettingsPayments from "./SettingsPayments";
import SettingsStoreInfo from "./SettingsStoreInfo";

/** Where each field error lives, so we can scroll to the first problem. */
const ERROR_SECTIONS: [SettingsFieldKey, string][] = [
  ["name", "sec-store"],
  ["supportEmail", "sec-store"],
  ["supportPhone", "sec-store"],
  ["address", "sec-store"],
  ["insideDhaka", "sec-delivery"],
  ["outsideDhaka", "sec-delivery"],
  ["freeDeliveryThreshold", "sec-delivery"],
  ["bkashNumber", "sec-payments"],
  ["nagadNumber", "sec-payments"],
  ["rocketNumber", "sec-payments"],
  ["lowStockThreshold", "sec-inventory"],
];

export default function SettingsForm({ initial }: { initial: StoreConfig }) {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<StoreConfig>(initial);
  const [errors, setErrors] = useState<SettingsFieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);

  const formRef = useRef(form);
  formRef.current = form;

  const touch = useCallback((keys: SettingsFieldKey[]) => {
    setDirty(true);
    setErrors((prev) => {
      if (!keys.some((k) => prev[k])) return prev;
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const setStore = useCallback(
    (patch: Partial<StoreSettings>) => {
      setForm((f) => ({ ...f, store: { ...f.store, ...patch } }));
      touch(Object.keys(patch) as SettingsFieldKey[]);
    },
    [touch],
  );

  const setDelivery = useCallback(
    (patch: Partial<DeliverySettings>) => {
      setForm((f) => ({ ...f, delivery: { ...f.delivery, ...patch } }));
      touch(["insideDhaka", "outsideDhaka", "freeDeliveryThreshold"]);
    },
    [touch],
  );

  const setWallet = useCallback(
    (id: WalletId, patch: Partial<PaymentWallet>) => {
      setForm((f) => ({ ...f, payments: { ...f.payments, [id]: { ...f.payments[id], ...patch } } }));
      touch([`${id}Number`]);
    },
    [touch],
  );

  const setInventory = useCallback(
    (patch: Partial<InventorySettings>) => {
      setForm((f) => ({ ...f, inventory: { ...f.inventory, ...patch } }));
      touch(["lowStockThreshold"]);
    },
    [touch],
  );

  function fail(errs: SettingsFieldErrors, message?: string) {
    setErrors(errs);
    const count = Object.keys(errs).length;
    toast.error(message ?? `Please fix ${count} field${count > 1 ? "s" : ""} before saving`);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    const first = ERROR_SECTIONS.find(([k]) => errs[k]);
    if (first) document.getElementById(first[1])?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const check = validateSettings(formRef.current);
    if (!check.ok) return fail(check.errors);

    setSaving(true);
    try {
      const res = await updateSettings(formRef.current);
      if (!res.ok) {
        if (res.fieldErrors && Object.keys(res.fieldErrors).length)
          return fail(res.fieldErrors, res.error);
        toast.error(res.error);
        return;
      }
      // Show the normalised values the server actually stored
      setForm(check.data);
      setDirty(false);
      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const blockNavigation = useCallback((href: string) => setLeaveTo(href), []);
  useUnsavedChangesGuard(dirty && !saving, blockNavigation);

  const leave = () => {
    const href = leaveTo ?? "/admin";
    setDirty(false);
    setLeaveTo(null);
    router.push(href);
  };

  return (
    <>
      <form id="settings-form" noValidate onSubmit={onSubmit}>
        <fieldset disabled={saving} className="space-y-5 sm:space-y-6 border-0 p-0 m-0 min-w-0">
          <SettingsStoreInfo value={form.store} errors={errors} onChange={setStore} />
          <SettingsDelivery value={form.delivery} errors={errors} onChange={setDelivery} />
          <SettingsPayments value={form.payments} errors={errors} onChange={setWallet} />
          <SettingsInventory value={form.inventory} errors={errors} onChange={setInventory} />
        </fieldset>
      </form>

      {/* Sticky save bar */}
      <div className="save-bar fixed bottom-0 left-0 right-0 lg:left-[264px] z-40">
        <div className="max-w-[1400px] px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <p className="hidden sm:flex items-center gap-2 text-sm text-[var(--mute)] mr-auto">
            <span
              className={`w-2 h-2 rounded-full ${dirty ? "bg-[var(--ink)]" : "bg-[var(--line)]"}`}
              aria-hidden="true"
            />
            {saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <button
            type="button"
            className="btn-ghost flex-1 sm:flex-none justify-center"
            disabled={saving || !dirty}
            onClick={() => {
              setForm(initial);
              setErrors({});
              setDirty(false);
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            form="settings-form"
            className={`btn-solid flex-[2] sm:flex-none justify-center sm:min-w-[170px] ${shake ? "shake" : ""}`}
            disabled={saving || !dirty}
          >
            {saving ? (
              <span className="spin" aria-hidden="true" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 5 5L20 7" />
              </svg>
            )}
            Save Settings
          </button>
        </div>
      </div>

      <DiscardDialog open={leaveTo !== null} onStay={() => setLeaveTo(null)} onLeave={leave} />
    </>
  );
}
