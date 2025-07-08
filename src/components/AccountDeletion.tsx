"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountDeletion() {
  const router = useRouter();
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      return response.json();
    },
    onSuccess: () => {
      router.push('/');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteAccountMutation.mutate();
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please type your email to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4 py-2">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              className="col-span-3 hover:border-input focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
