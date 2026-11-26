"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { updateProductStock } from "@/db/actions/admin/product.admin.action";

interface Props {
  productId: string;
  productName: string;
  stock: number;
}

/** Inline restock control: type a new quantity (or use +10) and save. */
export default function StockEditor({ productId, productName, stock }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(String(stock));
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  const changed = value !== "" && Number(value) !== stock;

  async function save(next = value) {
    if (next === "" || saving) return;
    setSaving(true);
    try {
      const res = await updateProductStock(productId, next);
      if (!res.ok) return toast.error(res.error);
      toast.success(`${productName}: stock set to ${res.data.stock}`);
      setValue(String(res.data.stock));
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't update stock. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="flex items-center gap-1.5 justify-end"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <input
        className="inp !h-9 !w-[74px] !px-2 text-center text-sm font-display font-bold !rounded-xl"
        inputMode="numeric"
        value={value}
        aria-label={`New stock for ${productName}`}
        disabled={saving}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      <button
        type="button"
        className="btn-ghost !h-9 !px-2.5 text-xs"
        disabled={saving}
        aria-label={`Add 10 units to ${productName}`}
        onClick={() => {
          const next = String((Number(value) || 0) + 10);
          setValue(next);
          save(next);
        }}
      >
        +10
      </button>
      <button type="submit" className="btn-solid !h-9 !px-3 text-xs min-w-[64px] justify-center" disabled={!changed || saving}>
        {saving ? <span className="spin !w-3.5 !h-3.5" /> : "Save"}
      </button>
    </form>
  );
}
