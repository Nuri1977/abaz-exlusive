"use client";

import { useState } from "react";
import Image from "next/image";
import {
  createCategoryFormSchema,
  type CreateCategoryFormValues,
} from "@/schemas/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";

import type { FileUploadThing } from "@/types/UploadThing";
import { categoryKeys } from "@/lib/query/categories";
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

interface CreateCategoryDialogProps {
  categories?: (Category & {
    children?: Category[];
    parent?: Category | null;
  })[];
  children?: React.ReactNode;
}

export function CreateCategoryDialog({
  categories,
  children,
}: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: uploadImage } = useGalleryMutation();
  const { mutate: deleteImage } = useDeleteGalleryMutation();

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: null,
      parentId: null,
      isActive: true,
    },
  });

  const { mutate: createCategory, isPending } = useMutation({
    mutationFn: async (values: CreateCategoryFormValues) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const newCategory = await response.json();

      // Handle gallery item if there's an image
      if (values.image?.key) {
        // Create gallery item with reference
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
          reference: newCategory.id,
          metadata: {},
          width: null,
          height: null,
          tags: ["category"],
          uploadedBy: null,
          usedIn: [],
          isDeleted: false,
        });
      }

      return newCategory;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      // Invalidate both admin and public category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Filter out categories based on level to prevent deep nesting
  const availableParentCategories =
    categories?.filter((category) => category.level < 2) || [];

  const onSubmit = (values: CreateCategoryFormValues) => {
    // If parentId is "none", set it to null
    if (values.parentId === "none") {
      values.parentId = null;
    }
    createCategory(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 size-4" /> Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
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
                    onValueChange={(value) => field.onChange(value || null)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableParentCategories?.map((category) => (
                        <SelectItem key={category?.id} value={category?.id}>
                          {category?.name}
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
              {isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
