"use client";

import { useEffect } from "react";
import type { User } from "@prisma/client";

import { useToast } from "@/hooks/useToast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteUser } from "@/controllers/users/usersController";

interface ConfirmDeleteDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onDeleteUser: (id: string) => void;
}

export function ConfirmDeleteDialog({
  user,
  isOpen,
  onClose,
  onDeleted,
  onDeleteUser,
}: ConfirmDeleteDialogProps) {
  const { toast } = useToast();
  const deleteUser = useDeleteUser();
  const isDeleting = deleteUser.isPending;

  // Handle mutation errors
  useEffect(() => {
    if (deleteUser.error) {
      toast({
        title: "Error",
        description:
          deleteUser.error instanceof Error
            ? deleteUser.error.message
            : "Failed to delete user",
        variant: "destructive",
      });
      onClose();
    }
  }, [deleteUser.error, toast, onClose]);

  if (!user) {
    return null;
  }

  const handleDelete = async () => {
    if (!user?.id) return;

    try {
      onDeleteUser(user.id);
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
      onDeleted();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the user account for{" "}
            <strong>{user?.name || user?.email || "this user"}</strong>. This
            action cannot be undone and will remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
