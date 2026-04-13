import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  onNewTask: () => void;
};

export function Header({ onNewTask }: Props) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/80 bg-white/80 px-6 py-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Care Operations Task Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Track follow-ups, ownership, and completion status
        </p>
      </div>
      <div className="flex shrink-0">
        <Button type="button" onClick={onNewTask}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>
    </header>
  );
}
