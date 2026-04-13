import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { TestQueryProvider, createTestQueryClient } from "@/test/queryClient";
import { createTask } from "@/api/tasksApi";

vi.mock("@/api/tasksApi", () => ({
  createTask: vi.fn(),
}));

const mockedCreateTask = vi.mocked(createTask);

describe("CreateTaskModal", () => {
  beforeEach(() => {
    mockedCreateTask.mockReset();
  });

  it("shows validation error when title is empty on submit", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const client = createTestQueryClient();
    render(
      <TestQueryProvider client={client}>
        <CreateTaskModal open onClose={onClose} members={[]} />
      </TestQueryProvider>,
    );

    await user.click(screen.getByRole("button", { name: /^create task$/i }));

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
    });
    expect(mockedCreateTask).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
