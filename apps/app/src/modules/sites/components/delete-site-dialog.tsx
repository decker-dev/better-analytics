"use client";

import { useState, useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { deleteSite } from "../actions/delete-site";
import type { ActionState } from "@/modules/shared/lib/middleware-action";

interface DeleteSiteDialogProps {
  siteId: string;
  siteName: string;
  orgSlug: string;
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export const DeleteSiteDialog = ({
  siteId,
  siteName,
  orgSlug,
}: DeleteSiteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [state, action, isPending] = useActionState(deleteSite, initialState);

  const isConfirmationValid = confirmationText === siteName;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
          Delete Site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Site
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-semibold">{siteName}</span> and all of its
            analytics data.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          {/* Hidden fields */}
          <input type="hidden" name="siteId" value={siteId} />
          <input type="hidden" name="orgSlug" value={orgSlug} />

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <span className="font-semibold">{siteName}</span> to
                confirm:
              </Label>
              <Input
                id="confirmation"
                name="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={siteName}
                className={
                  state?.errors?.confirmation ? "border-red-500" : "w-full"
                }
                disabled={isPending}
                aria-describedby="confirmation-error"
              />
              {state?.errors?.confirmation && (
                <p id="confirmation-error" className="text-sm text-red-500">
                  {state.errors.confirmation[0]}
                </p>
              )}
            </div>

            {state?.message && (
              <Alert variant={state.success ? "default" : "destructive"}>
                {state.success && <CheckCircle2 className="h-4 w-4" />}
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isConfirmationValid || isPending}
            >
              {isPending ? "Deleting..." : "Delete Site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
