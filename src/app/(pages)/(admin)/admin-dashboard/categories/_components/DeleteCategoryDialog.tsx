"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Trash2 } from "lucide-react";

import type { FileUploadThing } from "@/types/UploadThing";
import { categoryKeys } from "@/lib/query/categories";
import { useDeleteGalleryMutation } from "@/hooks/useGallery";
import { useToast } from "@/hooks/useToast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

interface DeleteCategoryDialogProps {
  category: Category & {
    image: FileUploadThing | null;
    children?: Category[];
  };
}

export function DeleteCategoryDialog({ category }: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: deleteGalleryItem } = useDeleteGalleryMutation();

  const { mutate: deleteCategory, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      // Invalidate both admin and public category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {(category.children?.length ?? 0) > 0 && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This category has {category.children?.length} subcategories. If
              you delete this category, all subcategories will become top-level
              categories.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteCategory()}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
