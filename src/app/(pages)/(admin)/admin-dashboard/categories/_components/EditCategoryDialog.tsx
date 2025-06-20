"use client";

import { useState } from "react";
import Image from "next/image";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/schemas/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";

import type { FileUploadThing } from "@/types/UploadThing";
import {
  useDeleteGalleryMutation,
  useGalleryMutation,
} from "@/hooks/useGallery";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/utils/uploadthing";

interface EditCategoryDialogProps {
  category: Category & {
    image: FileUploadThing | null;
  };
}

export function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: createGalleryItem } = useGalleryMutation();
  const { mutate: deleteGalleryItem } = useDeleteGalleryMutation();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
      image: category.image,
    },
  });

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const updatedCategory = await response.json();

      // Handle gallery item if there's an image change
      if (values.image?.key && values.image?.key !== category.image?.key) {
        // Delete old image if it exists
        if (category.image?.key) {
          deleteGalleryItem(category.image.key);
        }

        // Create new gallery item with reference
        createGalleryItem({
          name: values.image.name,
          size: values.image.size,
          key: values.image.key,
          lastModified: Math.floor(
            (values.image.lastModified || Date.now()) / 1000
          ),
          serverData: values.image.serverData,
          url: values.image.url,
          appUrl: values.image.url,
          ufsUrl: values.image.url,
          customId: null,
          type: values.image.type,
          fileHash: values.image.key,
          reference: category.id,
          metadata: {},
          width: null,
          height: null,
          tags: ["category"],
          uploadedBy: values.image.serverData?.uploadedBy || null,
          usedIn: [],
          isDeleted: false,
        });
      }

      return updatedCategory;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: CategoryFormValues) {
    updateCategory(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
          <span className="sr-only">Edit category</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Category description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {field.value?.url ? (
                        <div className="group relative size-40">
                          <Image
                            src={field.value.url}
                            alt="Category image"
                            fill
                            className="rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => {
                              if (field.value?.key) {
                                deleteGalleryItem(field.value.key);
                                field.onChange(null);
                              }
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res?.[0]) {
                              field.onChange(res[0]);
                            }
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              title: "Error",
                              description: error.message,
                              variant: "destructive",
                            });
                          }}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
