import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ControlsRow } from "@/components/layout/ControlsRow";
import type { Member } from "@/types/member";

const members: Member[] = [
  {
    id: "m-1",
    displayName: "Jordan Lee",
    email: "jordan@example.com",
    title: "Coordinator",
    createdAtUtc: "2026-01-01T00:00:00.000Z",
  },
];

const base = {
  search: "",
  onSearchChange: vi.fn(),
  status: "all" as const,
  onStatusChange: vi.fn(),
  priority: "all" as const,
  onPriorityChange: vi.fn(),
  assignee: "all" as const,
  onAssigneeChange: vi.fn(),
  sortBy: "created" as const,
  onSortByChange: vi.fn(),
  sortDir: "desc" as const,
  onSortDirChange: vi.fn(),
  members,
  onNewMember: vi.fn(),
  onManageMembers: vi.fn(),
};

describe("ControlsRow", () => {
  it("calls onSearchChange when the user types in the search field", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<ControlsRow {...base} onSearchChange={onSearchChange} />);
    const input = document.getElementById("task-search") as HTMLInputElement;
    await user.type(input, "vendor");
    expect(onSearchChange.mock.calls.map((c) => c[0]).join("")).toBe("vendor");
  });

  it("calls onStatusChange when the status filter changes", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    render(<ControlsRow {...base} onStatusChange={onStatusChange} />);
    const statusSelect = document.getElementById("filter-status") as HTMLSelectElement;
    await user.selectOptions(statusSelect, "completed");
    expect(onStatusChange).toHaveBeenCalledWith("completed");
  });

  it("reflects controlled search value", () => {
    render(<ControlsRow {...base} search="linen" />);
    expect(document.getElementById("task-search")).toHaveValue("linen");
  });
});
