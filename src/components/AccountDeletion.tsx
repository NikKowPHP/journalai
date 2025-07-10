"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [userEmail, setUserEmail] = useState("");

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

  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (userData?.email) {
      setUserEmail(userData.email);
    }
  }, [userData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailConfirmation !== userEmail) return;
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
              This action cannot be undone. Please type your exact email address ("{userEmail}") to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4 py-2">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={emailConfirmation}
                onChange={(e) => setEmailConfirmation(e.target.value)}
                className="col-span-3 hover:border-input focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteAccountMutation.isPending || emailConfirmation !== userEmail}
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
