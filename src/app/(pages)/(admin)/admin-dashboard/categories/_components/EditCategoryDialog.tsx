"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useToast } from "@/hooks/useToast";
import { useGalleryMutation, useDeleteGalleryMutation } from "@/hooks/useGallery";
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
import type { FileUploadThing } from "@/types/UploadThing";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.custom<FileUploadThing>().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCategoryDialogProps {
  category: Category & {
    image: string | FileUploadThing | null;
  };
}

export function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: createGalleryItem } = useGalleryMutation();
  const { mutate: deleteGalleryItem } = useDeleteGalleryMutation();

  // Safely parse the image data
  const parseImage = (imageData: string | FileUploadThing | null): FileUploadThing | null => {
    if (!imageData) return null;
    if (typeof imageData === "string") {
      try {
        return JSON.parse(imageData);
      } catch (error) {
        console.error("Failed to parse image data:", error);
        return null;
      }
    }
    return imageData;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      image: parseImage(category?.image),
    },
  });

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch(`/api/admin/categories/${category?.id}`, {
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
      if (values.image?.key && values.image?.key !== parseImage(category?.image)?.key) {
        // Delete old image if it exists
        if (category?.image) {
          const oldImage = parseImage(category.image);
          if (oldImage?.key) {
            deleteGalleryItem(oldImage.key);
          }
        }

        // Create new gallery item with reference
        createGalleryItem({
          name: values.image.name,
          size: values.image.size,
          key: values.image.key,
          lastModified: Math.floor((values.image.lastModified || Date.now()) / 1000),
          serverData: values.image.serverData || {},
          url: values.image.url,
          appUrl: values.image.url,
          ufsUrl: values.image.url,
          customId: null,
          type: "image",
          fileHash: values.image.key,
          reference: category.id,
          metadata: {},
          width: null,
          height: null,
          tags: ["category"],
          uploadedBy: null,
          usedIn: [],
          isDeleted: false
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

  function onSubmit(values: FormValues) {
    updateCategory(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Category description"
                      {...field}
                      value={field.value || ""}
                    />
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
                  <FormLabel>Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {field.value ? (
                        <div className="relative">
                          <Image
                            src={field.value.url}
                            alt="Category image"
                            width={100}
                            height={100}
                            className="rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute -right-2 -top-2 size-6 rounded-full p-0"
                            onClick={() => {
                              if (field.value?.key) {
                                deleteGalleryItem(field.value.key);
                              }
                              field.onChange(null);
                            }}
                          >
                            <X className="size-4" />
                            <span className="sr-only">Remove image</span>
                          </Button>
                        </div>
                      ) : (
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res?.[0]) {
                              field.onChange(res[0]);
                              // Convert UploadThing response to Gallery type
                              const galleryItem = {
                                name: res[0].name,
                                size: res[0].size,
                                key: res[0].key,
                                url: res[0].url,
                                lastModified: Math.floor(Date.now() / 1000),
                                serverData: {},
                                metadata: {},
                                type: "image",
                                fileHash: "",
                                height: null,
                                width: null,
                                customId: null,
                                reference: null,
                                tags: [],
                                uploadedBy: null,
                                usedIn: [],
                                isDeleted: false,
                                appUrl: res[0].url,
                                ufsUrl: res[0].url,
                              };
                              createGalleryItem(galleryItem);
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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
