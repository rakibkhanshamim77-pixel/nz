import type { ContactStats } from "@/db/actions/admin/contact.admin.action";

const STAT_CARDS = [
  { key: "total", label: "Total", color: "text-[var(--ink)]" },
  { key: "new", label: "New", color: "text-blue-600" },
  { key: "unread", label: "Unread", color: "text-orange-600" },
  { key: "in_progress", label: "In Progress", color: "text-yellow-600" },
  { key: "replied", label: "Replied", color: "text-purple-600" },
  { key: "resolved", label: "Resolved", color: "text-green-600" },
  { key: "closed", label: "Closed", color: "text-[var(--mute)]" },
] as const;

export default function ContactDashboard({ stats }: { stats: ContactStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {STAT_CARDS.map(({ key, label, color }) => (
        <div key={key} className="card p-4 text-center">
          <p className={`text-2xl font-display font-bold ${color}`}>
            {stats[key as keyof ContactStats]}
          </p>
          <p className="text-xs text-[var(--mute)] mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
