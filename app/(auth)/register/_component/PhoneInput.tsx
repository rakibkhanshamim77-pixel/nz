"use client";

import { useState, useEffect } from "react";

interface CountryInfo {
  code: string;   // e.g. "BD"
  dial: string;   // e.g. "+880"
  flag: string;   // emoji flag
}

// Minimal dial code map — covers common countries
const DIAL_CODES: Record<string, { dial: string; flag: string }> = {
  BD: { dial: "+880", flag: "🇧🇩" }, US: { dial: "+1",   flag: "🇺🇸" },
  GB: { dial: "+44",  flag: "🇬🇧" }, IN: { dial: "+91",  flag: "🇮🇳" },
  PK: { dial: "+92",  flag: "🇵🇰" }, AU: { dial: "+61",  flag: "🇦🇺" },
  CA: { dial: "+1",   flag: "🇨🇦" }, DE: { dial: "+49",  flag: "🇩🇪" },
  FR: { dial: "+33",  flag: "🇫🇷" }, AE: { dial: "+971", flag: "🇦🇪" },
  SA: { dial: "+966", flag: "🇸🇦" }, MY: { dial: "+60",  flag: "🇲🇾" },
  SG: { dial: "+65",  flag: "🇸🇬" }, JP: { dial: "+81",  flag: "🇯🇵" },
  CN: { dial: "+86",  flag: "🇨🇳" }, ID: { dial: "+62",  flag: "🇮🇩" },
  NG: { dial: "+234", flag: "🇳🇬" }, KE: { dial: "+254", flag: "🇰🇪" },
  EG: { dial: "+20",  flag: "🇪🇬" }, TR: { dial: "+90",  flag: "🇹🇷" },
  IT: { dial: "+39",  flag: "🇮🇹" }, ES: { dial: "+34",  flag: "🇪🇸" },
  NL: { dial: "+31",  flag: "🇳🇱" }, KR: { dial: "+82",  flag: "🇰🇷" },
  BR: { dial: "+55",  flag: "🇧🇷" }, MX: { dial: "+52",  flag: "🇲🇽" },
  PH: { dial: "+63",  flag: "🇵🇭" }, TH: { dial: "+66",  flag: "🇹🇭" },
  VN: { dial: "+84",  flag: "🇻🇳" }, RU: { dial: "+7",   flag: "🇷🇺" },
};

function detectCountry(): CountryInfo {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.split("-").pop()?.toUpperCase() ?? "BD";
    const info = DIAL_CODES[region];
    if (info) return { code: region, ...info };
  } catch {}
  return { code: "BD", ...DIAL_CODES.BD };
}

interface PhoneInputProps {
  value: string;
  onChange: (phone: string, dialCode: string) => void;
}

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [country, setCountry] = useState<CountryInfo>({ code: "BD", ...DIAL_CODES.BD });
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detected = detectCountry();
    setCountry(detected);
    setMounted(true);
  }, []);

  const sortedCountries = Object.entries(DIAL_CODES)
    .map(([code, info]) => ({ code, ...info }))
    .sort((a, b) => a.code.localeCompare(b.code));

  function selectCountry(c: CountryInfo) {
    setCountry(c);
    setOpen(false);
    onChange(value, c.dial);
  }

  return (
    <div className="flex relative">
      {/* Country selector */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 h-12 border border-line rounded-l-[10px] border-r-0 shrink-0 hover:bg-soft transition"
        style={{ background: "var(--soft)", minWidth: "90px" }}
        suppressHydrationWarning
      >
        <span className="text-lg leading-none" suppressHydrationWarning>{mounted ? country.flag : ""}</span>
        <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }} suppressHydrationWarning>{mounted ? country.dial : "+880"}</span>
        <svg className="w-3.5 h-3.5 text-mute ml-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-line shadow-lg overflow-y-auto"
          style={{ background: "var(--bg)", width: "220px", maxHeight: "240px" }}
        >
          {sortedCountries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => selectCountry(c)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-soft transition text-left"
              style={{ color: "var(--ink)" }}
            >
              <span className="text-base">{c.flag}</span>
              <span className="font-medium">{c.code}</span>
              <span className="text-mute ml-auto">{c.dial}</span>
            </button>
          ))}
        </div>
      )}

      {/* Phone number input */}
      <input
        type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Phone number"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""), country.dial)}
        style={{
          flex: 1, padding: "0 14px", height: "48px",
          borderRadius: "0 10px 10px 0", border: "1.5px solid var(--line)",
          borderLeft: "none", background: "var(--bg)", color: "var(--ink)",
          fontSize: "15px", outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  );
}
