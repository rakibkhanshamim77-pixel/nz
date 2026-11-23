import { fmtDate } from "./orderConstants";
import AdminOrderActions from "./AdminOrderActions";

interface Activity {
  title: string;
  description?: string;
  isInternal?: boolean;
  performedByRole?: string;
  createdAt?: Date | string;
}

interface Props {
  activities: Activity[];
  orderId: string;
}

const ROLE_AVATAR: Record<string, string> = {
  admin: "A",
  moderator: "M",
  customer: "C",
  system: "S",
};

export default function OrderTimeline({ activities, orderId }: Props) {
  const reversed = [...activities].reverse();

  return (
    <section className="card p-5 sm:p-7">
      <h2 className="font-display font-bold text-lg mb-5">Activity Timeline</h2>

      {/* Note add form */}
      <AdminOrderActions orderId={orderId} />

      {/* Timeline list */}
      {reversed.length === 0 ? (
        <p className="text-sm text-[var(--mute)] mt-4">No activity yet.</p>
      ) : (
        <ol className="mt-4 space-y-0">
          {reversed.map((act, i) => (
            <li
              key={i}
              className={`flex gap-3 ${act.isInternal ? "opacity-70" : ""}`}
            >
              {/* Avatar + connector line */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[var(--soft)] border border-[var(--line)] flex items-center justify-center shrink-0 text-xs font-bold">
                  {ROLE_AVATAR[act.performedByRole ?? "system"] ?? "S"}
                </div>
                {i < reversed.length - 1 && (
                  <div className="w-0.5 flex-1 bg-[var(--line)] mt-1 min-h-[20px]" />
                )}
              </div>

              {/* Content */}
              <div className="pb-5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-sm">{act.title}</p>
                  {act.isInternal && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Internal
                    </span>
                  )}
                </div>
                {act.description && (
                  <p className="text-sm text-[var(--mute)] mt-0.5">{act.description}</p>
                )}
                <p className="text-xs text-[var(--mute)] mt-1">
                  {fmtDate(act.createdAt)} ·{" "}
                  {act.performedByRole === "admin" || act.performedByRole === "moderator"
                    ? "Admin"
                    : act.performedByRole === "customer"
                      ? "Customer"
                      : "System"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
