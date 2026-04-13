import { CheckCircle2, CircleDot, Layers, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Stat = { label: string; value: number; icon: typeof Layers; accent: string };

export function StatsRow({
  total,
  inProgress,
  overdue,
  completed,
}: {
  total: number;
  inProgress: number;
  overdue: number;
  completed: number;
}) {
  const items: Stat[] = [
    { label: "Total Tasks", value: total, icon: Layers, accent: "text-slate-600 bg-slate-100" },
    { label: "In Progress", value: inProgress, icon: CircleDot, accent: "text-sky-700 bg-sky-50" },
    { label: "Overdue", value: overdue, icon: AlertCircle, accent: "text-amber-800 bg-amber-50" },
    { label: "Completed", value: completed, icon: CheckCircle2, accent: "text-emerald-800 bg-emerald-50" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-card"
        >
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accent)}>
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
