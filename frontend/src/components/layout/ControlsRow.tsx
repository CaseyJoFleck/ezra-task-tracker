import { Search, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Member } from "@/types/member";
import type { TaskItemStatus, TaskPriority, TaskSortField, SortDirection } from "@/types/task";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: TaskItemStatus | "all";
  onStatusChange: (v: TaskItemStatus | "all") => void;
  priority: TaskPriority | "all";
  onPriorityChange: (v: TaskPriority | "all") => void;
  assignee: string | "all" | "unassigned";
  onAssigneeChange: (v: string | "all" | "unassigned") => void;
  sortBy: TaskSortField;
  onSortByChange: (v: TaskSortField) => void;
  sortDir: SortDirection;
  onSortDirChange: (v: SortDirection) => void;
  members: Member[];
  onNewMember: () => void;
  onManageMembers: () => void;
};

const selectClass =
  "block w-full min-w-0 max-w-full truncate rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-800 shadow-sm outline-none ring-slate-300 focus:ring-2";

export function ControlsRow({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assignee,
  onAssigneeChange,
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirChange,
  members,
  onNewMember,
  onManageMembers,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-card lg:flex-row lg:items-end lg:gap-4">
      <div className="relative w-full shrink-0 lg:max-w-[13rem] xl:max-w-[15rem]">
        <label htmlFor="task-search" className="sr-only">
          Search tasks
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          id="task-search"
          type="search"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-800 shadow-sm outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2",
          )}
        />
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-3 lg:gap-y-2">
        <div className="min-w-0">
          <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-slate-600">
            Status
          </label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as TaskItemStatus | "all")}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="filter-priority" className="mb-1 block text-xs font-medium text-slate-600">
            Priority
          </label>
          <select
            id="filter-priority"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "all")}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="filter-assignee" className="mb-1 block text-xs font-medium text-slate-600">
            Assignee
          </label>
          <select
            id="filter-assignee"
            value={assignee}
            onChange={(e) =>
              onAssigneeChange(e.target.value as string | "all" | "unassigned")
            }
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="sort" className="mb-1 block text-xs font-medium text-slate-600">
            Sort
          </label>
          <div className="flex gap-2">
            <select
              id="sort"
              value={`${sortBy}:${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split(":") as [TaskSortField, SortDirection];
                onSortByChange(by);
                onSortDirChange(dir);
              }}
              className={selectClass}
            >
              <option value="created:desc">Created (newest)</option>
              <option value="created:asc">Created (oldest)</option>
              <option value="due:asc">Due date (soonest)</option>
              <option value="due:desc">Due date (latest)</option>
              <option value="priority:desc">Priority (high first)</option>
              <option value="priority:asc">Priority (low first)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
        <span className="text-xs font-medium text-slate-600">Team</span>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="whitespace-nowrap"
            onClick={onManageMembers}
          >
            <Users className="h-4 w-4" />
            Manage members
          </Button>
          <Button type="button" variant="secondary" className="whitespace-nowrap" onClick={onNewMember}>
            <UserPlus className="h-4 w-4" />
            New member
          </Button>
        </div>
      </div>
    </div>
  );
}
