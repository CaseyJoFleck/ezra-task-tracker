import { Ban, CheckCircle2, CircleDot, Layers, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type StatCardKey = "total" | "inProgress" | "overdue" | "completed" | "canceled";

type Stat = {
  key: StatCardKey;
  label: string;
  value: number;
  icon: typeof Layers;
  accent: string;
};

type Props = {
  total: number;
  inProgress: number;
  overdue: number;
  completed: number;
  canceled: number;
  activeStat: StatCardKey | null;
  onToggleStat: (key: StatCardKey) => void;
};

export function StatsRow({
  total,
  inProgress,
  overdue,
  completed,
  canceled,
  activeStat,
  onToggleStat,
}: Props) {
  const items: Stat[] = [
    { key: "total", label: "Total Tasks", value: total, icon: Layers, accent: "text-slate-600 bg-slate-100" },
    { key: "inProgress", label: "In Progress", value: inProgress, icon: CircleDot, accent: "text-sky-700 bg-sky-50" },
    { key: "overdue", label: "Overdue", value: overdue, icon: AlertCircle, accent: "text-amber-800 bg-amber-50" },
    { key: "completed", label: "Completed", value: completed, icon: CheckCircle2, accent: "text-emerald-800 bg-emerald-50" },
    { key: "canceled", label: "Canceled", value: canceled, icon: Ban, accent: "text-stone-700 bg-stone-100" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map(({ key, label, value, icon: Icon, accent }) => {
        const selected = activeStat === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggleStat(key)}
            aria-pressed={selected}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-card transition-colors",
              "hover:border-slate-200 hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2",
              selected
                ? "border-sky-300 ring-2 ring-sky-200/90"
                : "border-slate-100",
            )}
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accent)}>
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
