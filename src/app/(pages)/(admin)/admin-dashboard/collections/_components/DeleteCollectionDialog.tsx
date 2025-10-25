"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { useToast } from "@/hooks/useToast";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

interface DeleteCollectionDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function deleteCollection(id: string) {
  const response = await fetch(`/api/admin/collections/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete collection");
  }
}

export function DeleteCollectionDialog({ collection, open, onOpenChange }: DeleteCollectionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteCollection(collection.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const hasProducts = collection._count.products > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Collection</AlertDialogTitle>
          <AlertDialogDescription>
            {hasProducts ? (
              <>
                Cannot delete "{collection.name}" because it has {collection._count.products} associated product{collection._count.products !== 1 ? "s" : ""}. 
                Please remove all products from this collection first.
              </>
            ) : (
              <>
                Are you sure you want to delete "{collection.name}"? This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          {!hasProducts && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Collection"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}