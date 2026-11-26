import { PROGRESS_STEPS, STATUS_LABELS } from "./orderConstants";
import StepperNextAction from "./StepperNextAction";

const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: (
    <>
      <rect x={3} y={6} width={18} height={12} rx={2} />
      <path d="M3 10h18" />
    </>
  ),
  confirmed: <path d="m5 12 5 5L20 7" />,
  processing: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  shipped: (
    <>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
      <circle cx={7} cy={18} r={1.6} />
      <circle cx={18} cy={18} r={1.6} />
    </>
  ),
  delivered: (
    <>
      <path d="M12 3 4 7v10l8 4 8-4V7z" />
      <path d="m8.5 12 2.5 2.5 4.5-4.5" />
    </>
  ),
};

interface Props {
  orderId: string;
  status: string;
  stepIndex: number;
  isTerminal: boolean;
  nextStatus: string | null;
}

export default function OrderStepper({
  orderId,
  status,
  stepIndex,
  isTerminal,
  nextStatus,
}: Props) {
  if (isTerminal) {
    return (
      <div className="card p-4 mb-5 bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-700 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx={12} cy={12} r={9} />
            <path d="m9 9 6 6M15 9l-6 6" />
          </svg>
          <p className="font-semibold text-red-800">
            Order status: {STATUS_LABELS[status] ?? status}
          </p>
        </div>
      </div>
    );
  }

  const fillPct =
    PROGRESS_STEPS.length > 1
      ? (Math.min(stepIndex, PROGRESS_STEPS.length - 1) /
          (PROGRESS_STEPS.length - 1)) *
        100
      : 0;

  return (
    <div className="card p-5 sm:p-7 mb-5">
      {/* Fill bar */}
      <div className="relative mb-6">
        <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-[var(--line)] rounded-full" />
        <div
          className="absolute top-[18px] left-[10%] h-0.5 bg-[var(--ink)] rounded-full transition-all duration-500"
          style={{ width: `${fillPct * 0.8}%` }}
        />
        <div className="grid grid-cols-5 relative z-10">
          {PROGRESS_STEPS.map((step, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all mb-2 ${
                    done
                      ? "bg-[var(--ink)] text-[var(--bg)] border-2 border-[var(--ink)]"
                      : current
                        ? "border-2 border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--ink)_12%,transparent)]"
                        : "border-2 border-[var(--line)] text-[var(--mute)] bg-[var(--surface)]"
                  }`}
                >
                  {done ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      viewBox="0 0 24 24"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      {STEP_ICONS[step]}
                    </svg>
                  )}
                </div>
                <b
                  className={`text-xs sm:text-[12.5px] leading-tight ${
                    done || current
                      ? "text-[var(--ink)]"
                      : "text-[var(--mute)] font-semibold"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </b>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next step action */}
      {nextStatus && (
        <StepperNextAction orderId={orderId} nextStatus={nextStatus} />
      )}
    </div>
  );
}
