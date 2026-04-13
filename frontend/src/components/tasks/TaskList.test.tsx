import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskList } from "@/components/tasks/TaskList";
import { makeTask } from "@/test/fixtures/tasks";

describe("TaskList", () => {
  it("renders task titles from props", () => {
    const tasks = [
      makeTask({ id: "a", title: "Alpha" }),
      makeTask({ id: "b", title: "Beta", status: "inProgress" }),
    ];
    render(
      <TaskList
        tasks={tasks}
        selectedId="a"
        onSelect={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByRole("button", { name: /alpha/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /beta/i })).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <TaskList
        tasks={[]}
        selectedId={null}
        onSelect={vi.fn()}
        isLoading
        isError={false}
      />,
    );
    expect(screen.getByLabelText(/loading tasks/i)).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });

  it("shows empty state when there are no tasks", () => {
    render(
      <TaskList
        tasks={[]}
        selectedId={null}
        onSelect={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByRole("heading", { name: /no tasks match your filters/i })).toBeInTheDocument();
    expect(
      screen.getByText(/try adjusting search or filters, or create a new task/i),
    ).toBeInTheDocument();
  });

  it("shows error state and calls onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <TaskList
        tasks={[]}
        selectedId={null}
        onSelect={vi.fn()}
        isLoading={false}
        isError
        errorMessage="Network error"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText(/could not load tasks/i)).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
