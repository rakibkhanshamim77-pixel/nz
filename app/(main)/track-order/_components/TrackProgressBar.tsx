"use client";

import { useEffect, useRef } from "react";

interface Step {
  t: string;
  d: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    t: "অর্ডার গৃহীত", d: "আমরা আপনার অর্ডার পেয়েছি",
    icon: <><path d="M6 4h12v16H6z" /><path d="M9 9h6M9 13h6" /></>,
  },
  {
    t: "পেমেন্ট যাচাই", d: "আপনার পেমেন্ট যাচাই করা হচ্ছে",
    icon: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>,
  },
  {
    t: "প্যাকিং", d: "পণ্য প্যাক করা হচ্ছে",
    icon: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  },
  {
    t: "কুরিয়ারে", d: "পণ্য আপনার দিকে আসছে",
    icon: <><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></>,
  },
  {
    t: "ডেলিভারি সম্পন্ন", d: "পণ্য আপনার হাতে পৌঁছেছে",
    icon: <path d="m5 12 5 5L20 7" />,
  },
];

const CHECK = <path d="m5 12 5 5L20 7" />;

interface Props {
  currentStep: number;
  percentage: number;
}

export default function TrackProgressBar({ currentStep, percentage }: Props) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (fillRef.current) {
        fillRef.current.style.width = `${percentage * 0.8}%`;
      }
    });
  }, [percentage]);

  return (
    <div role="list" aria-label="অর্ডারের অগ্রগতি"
      className="relative grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0">
      {/* Track background (desktop) */}
      <div className="absolute top-[19px] left-[10%] right-[10%] h-[2px] bg-line hidden md:block" />
      {/* Animated fill (desktop) */}
      <div
        ref={fillRef}
        className="absolute top-[19px] left-[10%] h-[2px] bg-ink hidden md:block"
        style={{ width: 0, transition: "width 0.6s ease" }}
      />

      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const now  = i === currentStep;
        const last = i === STEPS.length - 1;
        return (
          <div
            key={i}
            role="listitem"
            aria-current={now ? "step" : undefined}
            className="relative flex items-start gap-3.5 md:block md:text-center md:px-1"
          >
            {/* Vertical connector (mobile) */}
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute left-[16px] top-[34px] -bottom-4 w-[2px] md:hidden ${done ? "bg-ink" : "bg-line"}`}
              />
            )}

            {/* Node */}
            <span
              className={[
                "relative z-10 flex-shrink-0 w-[34px] h-[34px] md:w-10 md:h-10 rounded-full md:mx-auto grid place-items-center border-2 transition-[background,border-color,color] duration-200",
                done ? "bg-ink border-ink text-bg"
                     : now ? "bg-surface border-ink text-ink"
                            : "bg-surface border-line text-mute",
              ].join(" ")}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                {done ? CHECK : step.icon}
              </svg>
              {/* Pulse ring on current step */}
              {now && (
                <span className="absolute inset-[-8px] rounded-full border-2 border-ink opacity-30 animate-ping pointer-events-none" />
              )}
            </span>

            {/* Label */}
            <span className="min-w-0 pt-0.5 md:pt-0 md:block md:mt-3">
              <b className={`block text-sm leading-snug ${!done && !now ? "text-mute" : ""}`}>{step.t}</b>
              <span className="text-xs text-mute md:hidden">{step.d}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
