"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
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

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: createGalleryItem } = useGalleryMutation();
  const { mutate: deleteGalleryItem } = useDeleteGalleryMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: null,
    },
  });

  const { mutate: createCategory, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          image: values.image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const category = await response.json();
      
      // Create gallery item if there's an image
      if (values.image?.key) {
        createGalleryItem({
          name: values.image.name,
          size: values.image.size,
          key: values.image.key,
          lastModified: Math.floor((values.image.lastModified || Date.now()) / 1000),
          serverData: values.image.serverData,
          url: values.image.url,
          appUrl: values.image.url,
          ufsUrl: values.image.url,
          customId: null,
          type: values.image.type,
          fileHash: values.image.key,
          reference: category.id,
          metadata: {
            entityType: 'category',
            categoryName: values.name,
            uploadedBy: 'admin'
          },
          width: null,
          height: null,
          tags: ['category', values.name.toLowerCase()],
          uploadedBy: null,
          usedIn: [{
            type: 'category',
            id: category.id,
            name: values.name
          }],
          isDeleted: false
        });
      }

      return category;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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

  function onSubmit(values: FormValues) {
    createCategory(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Category
        </Button>
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
              {isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
