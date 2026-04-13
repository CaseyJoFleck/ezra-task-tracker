import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import { memberFormSchema, type MemberFormValues } from "@/schemas/taskForm";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateMemberModal({ open, onClose }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
    },
  });

  const onSubmit = async (_data: MemberFormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Member added", {
      description: "This is a demo — connect to the API when ready.",
    });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={isSubmitting ? () => {} : onClose} title="New member" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="member-name" className="block text-sm font-medium text-slate-700">
            Display name
          </label>
          <input
            id="member-name"
            autoComplete="name"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Add member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
