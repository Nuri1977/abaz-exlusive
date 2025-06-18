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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCategoryDialogProps {
  category: Category;
}

export function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
      image: category.image || null,
    },
  });

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
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

      return response.json();
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
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
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
                      {field.value?.url && (
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
                            onClick={async () => {
                              const button =
                                document.activeElement as HTMLButtonElement;
                              const originalContent = button.innerHTML;
                              button.disabled = true;
                              button.innerHTML =
                                '<Loader2 className="size-4 animate-spin" />';
                              try {
                                await fetch(
                                  `/api/admin/uploadthing/${field.value.key}`,
                                  {
                                    method: "DELETE",
                                  }
                                );
                                field.onChange(null);
                              } catch (error) {
                                button.innerHTML = originalContent;
                                button.disabled = false;
                              }
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}
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
