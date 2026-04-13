import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError, getProblemMessage } from "@/api/client";
import { deleteMember } from "@/api/membersApi";
import { ConfirmDeleteDialog } from "@/components/modals/ConfirmDeleteDialog";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import type { Member } from "@/types/member";

type Props = {
  open: boolean;
  onClose: () => void;
  members: Member[];
  onMemberDeleted?: (memberId: string) => void;
};

export function ManageMembersModal({ open, onClose, members, onMemberDeleted }: Props) {
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);

  const mutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: (_void, memberId) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Member removed");
      setPendingDelete(null);
      onMemberDeleted?.(memberId);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiError ? getProblemMessage(err.body) : "Could not remove member";
      toast.error(msg);
    },
  });

  const busy = mutation.isPending;
  const confirmOpen = pendingDelete !== null;

  return (
    <>
      <Modal
        open={open}
        onClose={busy || confirmOpen ? () => {} : onClose}
        title="Manage members"
        size="lg"
        description="Remove people from the team list. Tasks they were assigned to become unassigned."
      >
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
          {members.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">No members yet.</li>
          ) : (
            members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{m.displayName}</p>
                  {m.email ? (
                    <p className="truncate text-xs text-slate-500">{m.email}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="danger"
                  className="shrink-0"
                  onClick={() => setPendingDelete(m)}
                  disabled={busy}
                  aria-label={`Remove ${m.displayName}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </li>
            ))
          )}
        </ul>
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Done
          </Button>
        </div>
      </Modal>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => {
          if (!busy) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (!pendingDelete) return;
          mutation.mutate(pendingDelete.id);
        }}
        title="Remove this member?"
        body={
          pendingDelete
            ? `${pendingDelete.displayName} will be removed from the team. Tasks assigned to them will become unassigned.`
            : ""
        }
        busy={busy}
        confirmLabel="Remove"
      />
    </>
  );
}
