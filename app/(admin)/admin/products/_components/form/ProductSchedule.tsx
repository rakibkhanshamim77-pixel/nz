"use client";

import { useEffect, useState } from "react";
import { FieldError } from "./FormSection";

interface Props {
  open: boolean;
  date: string;
  time: string;
  error?: string;
  onChange: (patch: { publishDate?: string; publishTime?: string }) => void;
}

const localDateString = (d: Date) => {
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
};

/** Combines the date + time inputs (in the admin's own timezone) into an ISO timestamp. */
export function toPublishIso(date: string, time: string): string {
  if (!date) return "";
  const d = new Date(`${date}T${time || "00:00"}`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export default function ProductSchedule({ open, date, time, error, onChange }: Props) {
  const [minDate, setMinDate] = useState("");
  useEffect(() => setMinDate(localDateString(new Date())), []);

  const iso = toPublishIso(date, time);
  const summary = iso
    ? new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

  return (
    <div className={`sched ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="sched-in">
        <div className="grid grid-cols-2 gap-3 pt-4">
          <label className="block">
            <span className="flbl">Publish date</span>
            <input
              type="date"
              className={`inp !h-11 text-sm ${error ? "err" : ""}`}
              min={minDate}
              value={date}
              tabIndex={open ? 0 : -1}
              onChange={(e) => onChange({ publishDate: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="flbl">Time</span>
            <input
              type="time"
              className={`inp !h-11 text-sm ${error ? "err" : ""}`}
              value={time}
              tabIndex={open ? 0 : -1}
              onChange={(e) => onChange({ publishTime: e.target.value })}
            />
          </label>
        </div>
        <p className="hint">
          {error ? <FieldError id="publishAt-err" message={error} /> : summary && <span>Goes live {summary} (your local time)</span>}
        </p>
      </div>
    </div>
  );
}
