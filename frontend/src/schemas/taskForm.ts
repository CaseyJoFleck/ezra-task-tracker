import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(4000).optional().or(z.literal("")),
  status: z.enum(["todo", "inProgress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  assigneeMemberId: z.string().optional(),
  dueDate: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const memberFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(200),
  email: z
    .string()
    .max(320)
    .superRefine((val, ctx) => {
      if (!val.trim()) return;
      const r = z.string().email().safeParse(val);
      if (!r.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid email" });
      }
    }),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
