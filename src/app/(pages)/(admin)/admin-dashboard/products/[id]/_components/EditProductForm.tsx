"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  editProductFormSchema,
  type EditProductFormValues,
} from "@/schemas/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";

import { ProductExt } from "@/types/product";
import type { FileUploadThing } from "@/types/UploadThing";
import { brandOptions, genderOptions } from "@/constants/options";
import {
  useDeleteGalleryMutation,
  useGalleryMutation,
} from "@/hooks/useGallery";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import MultiImageUploader from "@/components/shared/MultiImageUploader";

interface EditProductFormProps {
  product: ProductExt | null;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const initialImages =
    (product?.images as any[])?.map((image: any, index: number) => ({
      url: typeof image === "string" ? image : image?.url || "",
      key: `existing-${product?.id}-${index}`,
      name: `Product Image ${index + 1}`,
      type: "image/jpeg",
      size: 0,
      lastModified: Date.now(),
      serverData: { uploadedBy: "existing" },
      appUrl: typeof image === "string" ? image : image?.url || "",
      ufsUrl: typeof image === "string" ? image : image?.url || "",
      customId: null,
      fileHash: `existing-${product?.id}-${index}`,
    })) || [];

  const [productImages, setProductImages] =
    useState<FileUploadThing[]>(initialImages);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price?.toString() || "",
      brand: product?.brand || "",
      material: product?.material || "",
      gender: product?.gender || "",
      style: product?.style || "",
      features: product?.features || [],
      categoryId: product?.categoryId || "",
      images: initialImages,
    },
  });

  const { mutate: updateProduct, isPending } = useMutation({
    mutationFn: async (values: EditProductFormValues) => {
      const response = await fetch(`/api/admin/products/${product?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          price: parseFloat(values.price),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate products queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product?.id] });

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      router.push("/admin-dashboard/products");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const { mutate: createGalleryItem } = useGalleryMutation();
  const { mutate: deleteGalleryItem } = useDeleteGalleryMutation();

  const handleImageChange = (
    value: FileUploadThing[],
    newFile?: FileUploadThing
  ) => {
    setProductImages(value);
    form.setValue("images", [...value]);

    // Only create gallery item for new uploads (not existing images)
    if (newFile && !newFile.key?.startsWith("existing-")) {
      createGalleryItem({
        name: newFile.name,
        size: newFile.size,
        key: newFile.key,
        lastModified: Math.floor((newFile.lastModified || Date.now()) / 1000),
        serverData: newFile.serverData || { uploadedBy: null },
        url: newFile.url,
        appUrl: newFile.url,
        ufsUrl: newFile.url,
        customId: null,
        type: newFile.type,
        fileHash: newFile.key,
        reference: null,
        metadata: {},
        width: null,
        height: null,
        tags: [],
        uploadedBy: newFile.serverData?.uploadedBy || null,
        usedIn: [],
        isDeleted: false,
      });
    }
  };

  const handleImageRemove = (value: FileUploadThing[], key?: string) => {
    setProductImages(value);
    form.setValue("images", [...value]);

    // Only delete from gallery if it's not an existing image
    if (key && !key.startsWith("existing-")) {
      deleteGalleryItem(key);
    }
  };

  function onSubmit(values: EditProductFormValues) {
    updateProduct(values);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/admin-dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brandOptions
                            .filter((opt) => opt.value !== "all")
                            .map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
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
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input placeholder="Material" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genderOptions
                            .filter((opt) => opt.value !== "all")
                            .map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
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
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="sneakers">Sneakers</SelectItem>
                          <SelectItem value="boots">Boots</SelectItem>
                          <SelectItem value="sandals">Sandals</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.parent
                              ? `${category.parent.name} > ${category.name}`
                              : category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiImageUploader
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                value={productImages}
                maxLimit={10}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin-dashboard/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
