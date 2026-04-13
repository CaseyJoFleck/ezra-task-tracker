import { describe, expect, it } from "vitest";
import { taskFormSchema } from "@/schemas/taskForm";

describe("taskFormSchema", () => {
  it("accepts a minimal valid create-task payload", () => {
    const parsed = taskFormSchema.parse({
      title: "Restock supply cart",
      description: "",
      status: "todo",
      priority: "medium",
      assigneeMemberId: "",
      dueDate: "",
    });
    expect(parsed.title).toBe("Restock supply cart");
  });

  it("rejects empty title", () => {
    const result = taskFormSchema.safeParse({
      title: "",
      description: "",
      status: "todo",
      priority: "low",
      assigneeMemberId: "",
      dueDate: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0]).toMatch(/title is required/i);
    }
  });

  it("rejects title longer than 500 characters", () => {
    const result = taskFormSchema.safeParse({
      title: "x".repeat(501),
      description: "",
      status: "todo",
      priority: "high",
      assigneeMemberId: "",
      dueDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 4000 characters", () => {
    const result = taskFormSchema.safeParse({
      title: "Ok",
      description: "y".repeat(4001),
      status: "inProgress",
      priority: "medium",
      assigneeMemberId: "",
      dueDate: "",
    });
    expect(result.success).toBe(false);
  });
});
