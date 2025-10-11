"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import type { FileUploadThing } from "@/types/UploadThing";
import {
  categoryKeys,
  fetchAdminCategories,
  type CategoryWithRelations,
} from "@/lib/query/categories";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/utils/uploadthing";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.custom<FileUploadThing>().nullable(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCategoryDialogProps {
  category: CategoryWithRelations;
  categories?: CategoryWithRelations[];
  children?: React.ReactNode;
}

export function EditCategoryDialog({
  category,
  categories,
  children,
}: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: uploadImage } = useGalleryMutation();
  const { mutate: deleteImage } = useDeleteGalleryMutation();

  // Fetch all categories for parent selection
  const { data: allCategories } = useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: fetchAdminCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use prop categories if provided, otherwise use fetched categories
  const categoriesData = categories || allCategories;

  // Filter out categories based on level and prevent self-selection
  const availableParentCategories =
    categoriesData?.filter(
      (cat: Category) => cat.level < 2 && cat.id !== category.id
    ) || [];

  // Safely parse the image data
  const parseImage = (
    imageData: string | FileUploadThing | null
  ): FileUploadThing | null => {
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
      parentId: category?.parentId || null,
      isActive: category?.isActive ?? true,
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
      if (
        values.image?.key &&
        values.image?.key !== parseImage(category?.image)?.key
      ) {
        // Delete old image if it exists
        if (category?.image) {
          const oldImage = parseImage(category.image);
          if (oldImage?.key) {
            deleteImage(oldImage.key);
          }
        }

        // Create new gallery item with reference
        uploadImage({
          name: values.image.name,
          size: values.image.size,
          key: values.image.key,
          lastModified: Math.floor(
            (values.image.lastModified || Date.now()) / 1000
          ),
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
      // Invalidate both admin and public category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
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
        {children || (
          <Button variant="outline" size="icon">
            <Pencil className="size-4" />
            <span className="sr-only">Edit category</span>
          </Button>
        )}
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
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category (Optional)</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableParentCategories?.map((cat: Category) => (
                        <SelectItem key={cat?.id} value={cat?.id}>
                          {cat?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                            src={field.value.ufsUrl}
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
                                deleteImage(field.value.key);
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
                                url: res[0].ufsUrl,
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
                                appUrl: res[0].ufsUrl,
                                ufsUrl: res[0].ufsUrl,
                              };
                              uploadImage(galleryItem);
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
