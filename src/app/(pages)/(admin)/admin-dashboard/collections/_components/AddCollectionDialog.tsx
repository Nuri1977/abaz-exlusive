"use client";


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { X } from "lucide-react";

import type { FileUploadThing } from "@/types/UploadThing";
import {
  useDeleteGalleryMutation,
  useGalleryMutation,
} from "@/hooks/useGallery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { UploadButton } from "@/utils/uploadthing";

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  image: z.custom<FileUploadThing>().nullable(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface AddCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function createCollection(data: CollectionFormData) {
  const response = await fetch("/api/admin/collections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create collection");
  }

  return response.json();
}

export function AddCollectionDialog({ open, onOpenChange }: AddCollectionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: uploadImage } = useGalleryMutation();
  const { mutate: deleteImage } = useDeleteGalleryMutation();

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
      image: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      toast({
        title: "Success",
        description: "Collection created successfully",
      });
      form.reset();
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

  const onSubmit = (values: CollectionFormData) => {
    if (values.image?.key) {
      // Create gallery item with reference
      uploadImage({
        name: values.image.name,
        size: values.image.size,
        key: values.image.key,
        url: values.image.ufsUrl,
        lastModified: Math.floor(Date.now() / 1000),
        serverData: {},
        metadata: {},
        type: "image",
        fileHash: "",
        height: null,
        width: null,
        customId: null,
        reference: `collection:${values.name}`,
        tags: ["collection"],
        uploadedBy: null,
        usedIn: [],
        isDeleted: false,
        appUrl: values.image.ufsUrl,
        ufsUrl: values.image.ufsUrl,
      });
    }

    createMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Collection</DialogTitle>
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
                    <Input
                      placeholder="Enter collection name"
                      {...field}
                      disabled={createMutation.isPending}
                    />
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
                      placeholder="Enter collection description"
                      {...field}
                      disabled={createMutation.isPending}
                      rows={3}
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
                    <div className="space-y-2">
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={field.value.ufsUrl}
                            alt="Collection"
                            className="h-16 w-16 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{field.value.name}</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (field.value?.key) {
                                  deleteImage(field.value.key);
                                }
                                field.onChange(null);
                              }}
                            >
                              <X className="size-4 mr-2" />
                              Remove
                            </Button>
                          </div>
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
                                tags: ["collection"],
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
                              title: "Upload Error",
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Collection"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}