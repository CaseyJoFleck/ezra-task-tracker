import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import { ApiError, getProblemMessage } from "@/api/client";
import { createMember } from "@/api/membersApi";
import { applyServerValidationErrors } from "@/api/validation";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import { memberFormSchema, type MemberFormValues } from "@/schemas/taskForm";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateMemberModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ displayName: "", email: "" });
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member added");
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      if (!applyServerValidationErrors(err, setError)) {
        const msg = err instanceof ApiError ? getProblemMessage(err.body) : "Could not add member";
        toast.error(msg);
      }
    },
  });

  const onSubmit = (data: MemberFormValues) => {
    mutation.mutate({
      displayName: data.displayName.trim(),
      email: data.email?.trim() || null,
    });
  };

  const busy = mutation.isPending;

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title="New member" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="member-name" className="block text-sm font-medium text-slate-700">
            Display name
          </label>
          <input
            id="member-name"
            autoComplete="name"
            disabled={busy}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
            {...register("displayName")}
          />
          {errors.displayName ? (
            <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="member-email" className="block text-sm font-medium text-slate-700">
            Email <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="member-email"
            type="email"
            autoComplete="email"
            disabled={busy}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
