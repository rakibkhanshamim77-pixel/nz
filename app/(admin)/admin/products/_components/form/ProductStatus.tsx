"use client";

import type { ProductStatus as Status } from "@/db/validation/product.validation";
import FormSection from "./FormSection";
import ProductSchedule from "./ProductSchedule";
import type { FormPatch } from "./formTypes";

interface Props {
  status: Status;
  publishDate: string;
  publishTime: string;
  error?: string;
  onChange: (patch: FormPatch) => void;
}

const OPTIONS: { value: Status; title: string; text: string; icon: React.ReactNode }[] = [
  { value: "active", title: "Active", text: "Visible on the store now", icon: <path d="m5 12 5 5L20 7" /> },
  { value: "draft", title: "Draft", text: "Hidden, keep editing", icon: <path d="M4 20h4L19 9l-4-4L4 16z" /> },
  { value: "scheduled", title: "Scheduled", text: "Goes live at a set time", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
];

export default function ProductStatus({ status, publishDate, publishTime, error, onChange }: Props) {
  return (
    <FormSection id="sec-status" title="Status" description="Who can see this product" compact>
      <div className="grid gap-2" role="radiogroup" aria-label="Product status">
        {OPTIONS.map((o) => (
          <label key={o.value} className="stat-opt">
            <input
              type="radio"
              name="status"
              value={o.value}
              checked={status === o.value}
              onChange={() => onChange({ status: o.value })}
            />
            <span className="so">
              <span className="so-i">
                <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{o.icon}</svg>
              </span>
              <span className="flex-1">
                <b>{o.title}</b>
                <small>{o.text}</small>
              </span>
              <span className="so-r" />
            </span>
          </label>
        ))}
      </div>
      <ProductSchedule
        open={status === "scheduled"}
        date={publishDate}
        time={publishTime}
        error={error}
        onChange={onChange}
      />
    </FormSection>
  );
}
