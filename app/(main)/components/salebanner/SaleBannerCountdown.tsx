"use client";

import { useEffect, useState } from "react";

function diff(deadline: Date) {
  const ms = Math.max(0, deadline.getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function SaleBannerCountdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline);
  const [time, setTime] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  const items = [
    { value: pad(time.days), label: "Days" },
    { value: pad(time.hours), label: "Hours" },
    { value: pad(time.minutes), label: "Minutes" },
    { value: pad(time.seconds), label: "Seconds" },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-7">
      {items.map(({ value, label }) => (
        <div
          key={label}
          className="bg-white/15 rounded-xl p-2.5 sm:p-3 min-w-[52px] sm:min-w-16 text-center"
        >
          <span className="block text-xl sm:text-2xl font-bold">{value}</span>
          <span className="text-[10px] sm:text-xs text-white/70">{label}</span>
        </div>
      ))}
    </div>
  );
}
