import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { makeTask } from "@/test/fixtures/tasks";

const noop = () => {};

describe("TaskDetailPanel", () => {
  it("renders empty state when no task is selected", () => {
    render(
      <TaskDetailPanel
        task={null}
        onEdit={noop}
        onDelete={noop}
        onMarkComplete={noop}
        onReopen={noop}
      />,
    );
    expect(screen.getByRole("heading", { name: /select a task/i })).toBeInTheDocument();
    expect(
      screen.getByText(/choose a task from the list to view details/i),
    ).toBeInTheDocument();
  });

  it("calls onMarkComplete for an active task", async () => {
    const user = userEvent.setup();
    const onMarkComplete = vi.fn();
    render(
      <TaskDetailPanel
        task={makeTask({ status: "todo" })}
        onEdit={noop}
        onDelete={noop}
        onMarkComplete={onMarkComplete}
        onReopen={noop}
      />,
    );
    await user.click(screen.getByRole("button", { name: /mark complete/i }));
    expect(onMarkComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onReopen for a terminal task (completed)", async () => {
    const user = userEvent.setup();
    const onReopen = vi.fn();
    const task = {
      ...makeTask(),
      id: "done-1",
      title: "Shipped checklist",
      status: "completed" as const,
      completedAtUtc: "2026-04-10T10:00:00.000Z",
    };
    render(
      <TaskDetailPanel
        task={task}
        onEdit={noop}
        onDelete={noop}
        onMarkComplete={noop}
        onReopen={onReopen}
      />,
    );
    expect(screen.queryByRole("button", { name: /^mark complete$/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /reopen/i }));
    expect(onReopen).toHaveBeenCalledTimes(1);
  });
});
