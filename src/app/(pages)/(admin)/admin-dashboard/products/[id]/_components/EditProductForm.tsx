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
import { ArrowLeft, Plus, X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

import type { ProductWithOptionsAndVariants, CategoryWithParent } from "@/types/product";
import type { FileUploadThing } from "@/types/UploadThing";
import { brandOptions, genderOptions } from "@/constants/options";
import type { Product } from "@prisma/client";
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
import { Badge } from "@/components/ui/badge";

interface EditProductFormProps {
  product: ProductWithOptionsAndVariants | null;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const initialImages = (product?.images ?? []).map((img, idx) => ({
    ...img,
    key: img.key || `existing-${product?.id}-${idx}`,
  }));

  const initialOptions = (product?.options ?? []).map((opt) => ({
    name: opt.name,
    values: opt.values.map((v) => v.value),
  }));

  const initialVariants = (product?.variants ?? []).map((v) => ({
    sku: v.sku,
    price: v.price?.toString() || "",
    stock: v.stock.toString(),
    options: v.options.map((opt) => ({
      optionName: opt.optionValue.option?.name || (product?.options?.find(o => o.id === opt.optionValue.optionId)?.name ?? ""),
      value: opt.optionValue.value,
    })),
    images: (v.images ?? []).map((img, idx) => ({
      ...img,
      key: img.key || `existing-variant-${v.id}-${idx}`,
    })),
  }));

  const [productImages, setProductImages] = useState<FileUploadThing[]>(initialImages);

  const { data: categories } = useQuery<CategoryWithParent[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json() as Promise<CategoryWithParent[]>;
    },
  });

  const { data: collections } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) throw new Error("Failed to fetch collections");
      return response.json() as Promise<{ id: string; name: string }[]>;
    },
  });

  const { data: optionTemplates } = useQuery<
    { id: string; name: string; values: { id: string; value: string }[] }[]
  >({
    queryKey: ["option-templates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/option-templates");
      if (!response.ok) throw new Error("Failed to fetch option templates");
      return response.json() as Promise<
        { id: string; name: string; values: { id: string; value: string }[] }[]
      >;
    },
  });

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price?.toString() || "",
      brand: product?.brand || "",
      gender: product?.gender || "",
      style: product?.style || "",
      categoryId: product?.categoryId || "",
      collectionId: product?.collectionId || "none",
      images: initialImages,
      options: initialOptions,
      variants: initialVariants,
    },
  });

  const { mutate: updateProduct, isPending } = useMutation<
    Product,
    Error,
    EditProductFormValues
  >({
    mutationFn: async (values) => {
      const response = await fetch(`/api/admin/products/${product?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          price: parseFloat(values.price),
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      return (await response.json()) as Product;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", product?.id] });
      toast({ title: "Success", description: "Product updated successfully" });
      router.push("/admin-dashboard/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const { mutate: createGalleryItem } = useGalleryMutation();
  const { mutate: deleteGalleryItem } = useDeleteGalleryMutation();

  function onSubmit(values: EditProductFormValues) {
    if (values.variants.length > 0 && !validateVariants()) return;
    updateProduct(values);
  }

  const addOption = () => {
    const options = form.getValues("options") || [];
    form.setValue("options", [...options, { name: "", values: [] }]);
  };

  const removeOption = (index: number) => {
    const options = form.getValues("options") || [];
    options.splice(index, 1);
    form.setValue("options", [...options]);
  };

  const handleTemplateSelect = (index: number, templateName: string) => {
    const options = form.getValues("options") || [];
    if (!options[index]) return;
    options[index].name = templateName;
    options[index].values = [];
    form.setValue("options", [...options]);
  };

  const toggleOptionValue = (optionIndex: number, value: string) => {
    const options = form.getValues("options") || [];
    if (!options[optionIndex]) return;

    const currentValues = options[optionIndex].values;
    if (currentValues.includes(value)) {
      options[optionIndex].values = currentValues.filter((v) => v !== value);
    } else {
      options[optionIndex].values = [...currentValues, value];
    }
    form.setValue("options", [...options]);
  };

  const generateVariants = () => {
    const options = form.getValues("options") || [];
    if (options.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one option before generating variants",
        variant: "destructive",
      });
      return;
    }

    const combinations = options.reduce((acc, option) => {
      if (acc.length === 0)
        return option.values.map((value) => [{ optionName: option.name, value }]);
      return acc.flatMap((combination) =>
        option.values.map((value) => [
          ...combination,
          { optionName: option.name, value },
        ])
      );
    }, [] as { optionName: string; value: string }[][]);

    const variants = combinations.map((combination, index) => ({
      sku: `SKU-${index + 1}`,
      price: form.getValues("price"),
      stock: "0",
      options: combination,
      images: [],
    }));

    form.setValue("variants", variants);
    toast({ title: "Success", description: `Generated ${variants.length} variants` });
  };

  const clearVariants = () => {
    form.setValue("variants", []);
    toast({ title: "Success", description: "Variants cleared" });
  };

  const validateVariants = () => {
    const variants = form.getValues("variants") || [];
    const invalidVariants = variants.filter((v) => !v.sku || !v.stock || v.stock === "0");
    if (invalidVariants.length > 0) {
      toast({
        title: "Error",
        description: "All variants must have a SKU and stock quantity",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleImageChange = (value: FileUploadThing[], newFile?: FileUploadThing) => {
    setProductImages(value);
    form.setValue("images", [...value]);
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
    if (key && !key.startsWith("existing-")) deleteGalleryItem(key);
  };

  const handleVariantImageChange = (index: number, value: FileUploadThing[], newFile?: FileUploadThing) => {
    const variants = form.getValues("variants") || [];
    if (!variants[index]) return;
    variants[index].images = value;
    form.setValue("variants", [...variants]);
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

  const handleVariantImageRemove = (index: number, value: FileUploadThing[], key?: string) => {
    const variants = form.getValues("variants") || [];
    if (!variants[index]) return;
    variants[index].images = value;
    form.setValue("variants", [...variants]);
    if (key && !key.startsWith("existing-")) deleteGalleryItem(key);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/admin-dashboard/products">
            <ArrowLeft className="size-4" />
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
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
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
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {brandOptions.filter(o => o.value !== "all").map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {genderOptions.filter(o => o.value !== "all").map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
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
                  name="collectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Collection</SelectItem>
                          {collections?.map((col) => (
                            <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
            <CardContent>
              <MultiImageUploader
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                value={productImages}
                maxLimit={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Options</CardTitle>
              <Button type="button" onClick={addOption}>
                <Plus className="mr-2 size-4" /> Add Option
              </Button>
            </CardHeader>
            <CardContent>
              {form.watch("options")?.map((option, idx) => {
                const template = optionTemplates?.find(t => t.name === option.name);
                return (
                  <div key={idx} className="mb-4 space-y-4 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`options.${idx}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Option Template</FormLabel>
                            <Select onValueChange={(val) => handleTemplateSelect(idx, val)} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {optionTemplates?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeOption(idx)} className="mt-8">
                        <X className="size-4" />
                      </Button>
                    </div>
                    {template && (
                      <div className="space-y-2">
                        <FormLabel>Select Values</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {template.values.map((v) => {
                            const isSelected = option.values.includes(v.value);
                            return (
                              <Badge
                                key={v.id}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                  "cursor-pointer px-3 py-1",
                                  isSelected ? "hover:bg-primary/90" : "hover:bg-accent"
                                )}
                                onClick={() => toggleOptionValue(idx, v.value)}
                              >
                                {v.value}{" "}
                                {isSelected && <Check className="ml-2 size-3" />}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {form.watch("options")?.length > 0 && (
                <Button type="button" onClick={generateVariants} className="mt-4">Generate Variants</Button>
              )}
            </CardContent>
          </Card>

          {form.watch("variants")?.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Product Variants</CardTitle>
                <Button type="button" variant="destructive" size="sm" onClick={clearVariants}>Clear Variants</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {form.watch("variants").map((variant, idx) => (
                    <div key={idx} className="space-y-4 rounded-lg border p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.sku`}
                          render={({ field }) => (
                            <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.price`}
                          render={({ field }) => (
                            <FormItem><FormLabel>Price (Optional)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.stock`}
                          render={({ field }) => (
                            <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormLabel>Variant Options</FormLabel>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {variant.options.map((opt, oIdx) => (
                            <div key={oIdx} className="rounded bg-muted p-2 text-sm">
                              <span className="font-medium">{opt.optionName}:</span> {opt.value}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <FormLabel>Variant Images</FormLabel>
                        <div className="mt-2">
                          <MultiImageUploader
                            onChange={(val, newFile) => handleVariantImageChange(idx, val, newFile)}
                            onRemove={(val, key) => handleVariantImageRemove(idx, val, key)}
                            value={variant.images || []}
                            maxLimit={5}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild><Link href="/admin-dashboard/products">Cancel</Link></Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Updating..." : "Update Product"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
