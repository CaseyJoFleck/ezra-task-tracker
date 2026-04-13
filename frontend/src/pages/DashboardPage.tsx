import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError, getProblemMessage } from "@/api/client";
import {
  deleteTask,
  fetchTasksForStats,
  fetchTasksList,
  patchTaskStatus,
  type TaskListParams,
} from "@/api/tasksApi";
import { fetchMembers } from "@/api/membersApi";
import { ControlsRow } from "@/components/layout/ControlsRow";
import { Header } from "@/components/layout/Header";
import { StatsRow, type StatCardKey } from "@/components/layout/StatsRow";
import { ConfirmDeleteDialog } from "@/components/modals/ConfirmDeleteDialog";
import { CreateMemberModal } from "@/components/modals/CreateMemberModal";
import { ManageMembersModal } from "@/components/modals/ManageMembersModal";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskList } from "@/components/tasks/TaskList";
import { taskStats } from "@/lib/taskFilters";
import type { SortDirection, TaskItemStatus, TaskPriority, TaskSortField } from "@/types/task";

export function DashboardPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskItemStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [assignee, setAssignee] = useState<string | "all" | "unassigned">("all");
  const [sortBy, setSortBy] = useState<TaskSortField>("created");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [activeStat, setActiveStat] = useState<StatCardKey | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listParams: TaskListParams = useMemo(() => {
    const p: TaskListParams = {
      sortBy,
      sortDir,
    };
    if (status !== "all") p.status = status;
    if (priority !== "all") p.priority = priority;
    if (assignee !== "all" && assignee !== "unassigned") p.assigneeMemberId = assignee;
    if (search.trim()) p.search = search;
    if (overdueFilter) p.overdueOnly = true;
    return p;
  }, [search, status, priority, assignee, sortBy, sortDir, overdueFilter]);

  const tasksListQuery = useQuery({
    queryKey: ["tasks", "list", listParams, assignee === "unassigned"] as const,
    queryFn: () =>
      fetchTasksList(listParams, { unassignedOnly: assignee === "unassigned" }),
  });

  const tasksStatsQuery = useQuery({
    queryKey: ["tasks", "stats"],
    queryFn: fetchTasksForStats,
  });

  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const visibleTasks = tasksListQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const stats = useMemo(() => taskStats(tasksStatsQuery.data ?? []), [tasksStatsQuery.data]);

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

  const selectedTask = selectedId ? visibleTasks.find((t) => t.id === selectedId) ?? null : null;

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createMemberOpen, setCreateMemberOpen] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const patchStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskItemStatus }) =>
      patchTaskStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        variables.status === "completed" ? "Marked complete" : "Task reopened",
      );
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiError ? getProblemMessage(err.body) : "Could not update status";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
      setDeleteOpen(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? getProblemMessage(err.body) : "Could not delete task";
      toast.error(msg);
    },
  });

  const handleMarkComplete = () => {
    if (!selectedTask) return;
    patchStatusMutation.mutate({ id: selectedTask.id, status: "completed" });
  };

  const handleReopen = () => {
    if (!selectedTask) return;
    patchStatusMutation.mutate({ id: selectedTask.id, status: "todo" });
  };

  const handleConfirmDelete = () => {
    if (!selectedTask) return;
    deleteMutation.mutate(selectedTask.id);
  };

  const handleToggleStat = (key: StatCardKey) => {
    if (activeStat === key) {
      setActiveStat(null);
      setStatus("all");
      setOverdueFilter(false);
      return;
    }
    setActiveStat(key);
    if (key === "total") {
      setStatus("all");
      setOverdueFilter(false);
    } else if (key === "inProgress") {
      setStatus("inProgress");
      setOverdueFilter(false);
    } else if (key === "overdue") {
      setStatus("all");
      setOverdueFilter(true);
    } else if (key === "completed") {
      setStatus("completed");
      setOverdueFilter(false);
    } else {
      setStatus("canceled");
      setOverdueFilter(false);
    }
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setActiveStat(null);
  };

  const handleStatusChange = (v: TaskItemStatus | "all") => {
    setStatus(v);
    setOverdueFilter(false);
    setActiveStat(null);
  };

  const handlePriorityChange = (v: TaskPriority | "all") => {
    setPriority(v);
    setActiveStat(null);
  };

  const handleAssigneeChange = (v: string | "all" | "unassigned") => {
    setAssignee(v);
    setActiveStat(null);
  };

  const handleSortByChange = (v: TaskSortField) => {
    setSortBy(v);
    setActiveStat(null);
  };

  const handleSortDirChange = (v: SortDirection) => {
    setSortDir(v);
    setActiveStat(null);
  };

  const listLoading = tasksListQuery.isPending;
  const listError = tasksListQuery.isError;
  const errorMessage = (() => {
    const e = tasksListQuery.error;
    if (!e) return undefined;
    if (e instanceof ApiError) return getProblemMessage(e.body);
    if (e instanceof Error) return e.message;
    return undefined;
  })();

  return (
    <div className="min-h-screen">
      <Header onNewTask={() => setCreateTaskOpen(true)} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <StatsRow
          total={stats.total}
          inProgress={stats.inProgress}
          overdue={stats.overdue}
          completed={stats.completed}
          canceled={stats.canceled}
          activeStat={activeStat}
          onToggleStat={handleToggleStat}
        />

        <ControlsRow
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          priority={priority}
          onPriorityChange={handlePriorityChange}
          assignee={assignee}
          onAssigneeChange={handleAssigneeChange}
          sortBy={sortBy}
          onSortByChange={handleSortByChange}
          sortDir={sortDir}
          onSortDirChange={handleSortDirChange}
          members={members}
          onNewMember={() => setCreateMemberOpen(true)}
          onManageMembers={() => setManageMembersOpen(true)}
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
              isLoading={listLoading}
              isError={listError}
              errorMessage={errorMessage}
              onRetry={() => tasksListQuery.refetch()}
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
              statusActionBusy={patchStatusMutation.isPending}
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
      <ManageMembersModal
        open={manageMembersOpen}
        onClose={() => setManageMembersOpen(false)}
        members={members}
        onMemberDeleted={(id) => {
          if (assignee === id) setAssignee("all");
        }}
      />
      <EditTaskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={selectedTask}
        members={members}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete this task?"
        body="This will permanently remove the task. This action cannot be undone."
        busy={deleteMutation.isPending}
      />
    </div>
  );
}
