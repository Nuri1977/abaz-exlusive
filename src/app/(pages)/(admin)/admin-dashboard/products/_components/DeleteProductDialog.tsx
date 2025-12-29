"use client";

import { useState } from "react";
import type { Product } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { useToast } from "@/hooks/useToast";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteProductDialogProps {
  product: Product;
  trigger?: React.ReactNode;
  asMenuItem?: boolean;
}

export function DeleteProductDialog({
  product,
  trigger,
  asMenuItem = false,
}: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: deleteProduct, isPending } = useMutation({
    mutationFn: async () => {
      console.log("Starting delete request for product:", product?.id);

      const response = await fetch(`/api/admin/products/${product?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response?.status);
      console.log("Delete response ok:", response?.ok);

      if (!response?.ok) {
        const errorData = await response?.text();
        console.error("Delete error response:", errorData);

        let errorMessage = "Failed to delete product";

        try {
          const parsedError = JSON.parse(errorData) as { message?: string };
          errorMessage = parsedError?.message || errorMessage;
        } catch {
          // If it's not JSON, use the text as error message
          errorMessage = errorData || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Handle 204 No Content response (successful deletion with no body)
      if (response.status === 204) {
        console.log("Delete success: 204 No Content");
        return { message: "Product deleted successfully" };
      }

      // Only try to parse JSON if there's content
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const result = (await response.json()) as { message?: string };
        console.log("Delete success response:", result);
        return result;
      }

      // Fallback for successful non-JSON responses
      console.log("Delete success: non-JSON response");
      return { message: "Product deleted successfully" };
    },
    onSuccess: (data) => {
      console.log("Delete mutation success:", data);
      toast({
        title: "Success",
        description: data?.message || "Product deleted successfully",
      });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
    onError: (error: Error) => {
      console.error("Delete product error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  if (asMenuItem) {
    return (
      <>
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Trash2 className="mr-2 size-4" />
          Delete Product
        </DropdownMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{product?.name}&quot;?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
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
                onClick={() => {
                  console.log(
                    "Attempting to delete product:",
                    product?.id,
                    product?.name
                  );
                  deleteProduct();
                }}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Trash2 className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{product?.name}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
            onClick={() => {
              console.log(
                "Attempting to delete product:",
                product?.id,
                product?.name
              );
              deleteProduct();
            }}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
