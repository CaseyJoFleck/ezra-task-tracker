import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { fetchMockMembers, fetchMockTasks } from "@/api/mockQueries";
import { ControlsRow } from "@/components/layout/ControlsRow";
import { Header } from "@/components/layout/Header";
import { StatsRow } from "@/components/layout/StatsRow";
import { ConfirmDeleteDialog } from "@/components/modals/ConfirmDeleteDialog";
import { CreateMemberModal } from "@/components/modals/CreateMemberModal";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskList } from "@/components/tasks/TaskList";
import { filterTasks, sortTasks, taskStats } from "@/lib/taskFilters";
import type { SortDirection, TaskItemStatus, TaskPriority, TaskSortField } from "@/types/task";

export function DashboardPage() {
  const [simulateTaskError, setSimulateTaskError] = useState(false);

  const tasksQuery = useQuery({
    queryKey: ["tasks", "mock", simulateTaskError],
    queryFn: () => fetchMockTasks({ simulateError: simulateTaskError, delayMs: 650 }),
  });

  const membersQuery = useQuery({
    queryKey: ["members", "mock"],
    queryFn: () => fetchMockMembers(350),
  });

  const allTasks = tasksQuery.data ?? [];
  const members = membersQuery.data ?? [];

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskItemStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [assignee, setAssignee] = useState<string | "all" | "unassigned">("all");
  const [sortBy, setSortBy] = useState<TaskSortField>("created");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleTasks = useMemo(() => {
    const f = filterTasks(allTasks, search, status, priority, assignee);
    return sortTasks(f, sortBy, sortDir);
  }, [allTasks, search, status, priority, assignee, sortBy, sortDir]);

  useEffect(() => {
    if (visibleTasks.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((id) => {
      if (id && visibleTasks.some((t) => t.id === id)) return id;
      return visibleTasks[0].id;
    });
  }, [visibleTasks]);

  const stats = useMemo(() => taskStats(allTasks), [allTasks]);
  const selectedTask = selectedId ? allTasks.find((t) => t.id === selectedId) ?? null : null;

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createMemberOpen, setCreateMemberOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const handleMarkComplete = () => {
    if (!selectedTask) return;
    toast.success("Marked complete", {
      description: "Demo only — wire PATCH /api/tasks/{id}/status when ready.",
    });
  };

  const handleReopen = () => {
    if (!selectedTask) return;
    toast.success("Task reopened", {
      description: "Demo only — wire PATCH /api/tasks/{id}/status when ready.",
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Task deleted", {
      description: "Demo only — no data was removed.",
    });
    setDeleteBusy(false);
    setDeleteOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Header onNewTask={() => setCreateTaskOpen(true)} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <StatsRow
          total={stats.total}
          inProgress={stats.inProgress}
          overdue={stats.overdue}
          completed={stats.completed}
        />

        <ControlsRow
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          priority={priority}
          onPriorityChange={setPriority}
          assignee={assignee}
          onAssigneeChange={setAssignee}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortDir={sortDir}
          onSortDirChange={setSortDir}
          members={members}
          onNewMember={() => setCreateMemberOpen(true)}
        />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <section className="lg:col-span-5" aria-label="Task list">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Task list
            </h2>
            <TaskList
              tasks={visibleTasks}
              selectedId={selectedId}
              onSelect={setSelectedId}
              isLoading={tasksQuery.isLoading}
              isError={tasksQuery.isError}
              errorMessage={tasksQuery.error instanceof Error ? tasksQuery.error.message : undefined}
              onRetry={() => tasksQuery.refetch()}
            />
          </section>
          <section className="lg:col-span-7" aria-label="Task details">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Task details
            </h2>
            <TaskDetailPanel
              task={selectedTask}
              onEdit={() => setEditOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              onMarkComplete={handleMarkComplete}
              onReopen={handleReopen}
            />
          </section>
        </div>
      </main>

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        members={members}
      />
      <CreateMemberModal open={createMemberOpen} onClose={() => setCreateMemberOpen(false)} />
      <EditTaskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={selectedTask}
        members={members}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => {
          if (!deleteBusy) setDeleteOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete this task?"
        body="This action cannot be undone. In this demo, nothing is deleted until the API is connected."
        busy={deleteBusy}
      />

      {import.meta.env.DEV ? (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg backdrop-blur"
            onClick={() => setSimulateTaskError((v) => !v)}
          >
            {simulateTaskError ? "Task load: error preview on" : "Task load: error preview off"}
          </button>
          <span className="max-w-[14rem] text-right text-[10px] text-slate-500">
            Toggle to preview the task list error state. Off by default.
          </span>
        </div>
      ) : null}
    </div>
  );
}
