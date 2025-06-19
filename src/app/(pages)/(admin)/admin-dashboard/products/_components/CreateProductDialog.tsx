"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import type { FileUploadThing } from "@/types/UploadThing";
import {
  useDeleteGalleryMutation,
  useGalleryMutation,
} from "@/hooks/useGallery";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import MultiImageUploader from "@/components/shared/MultiImageUploader";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  brand: z.string().min(1, "Brand is required"),
  gender: z.string().min(1, "Gender is required"),
  style: z.string().min(1, "Style is required"),
  categoryId: z.string().min(1, "Category is required"),
  images: z
    .array(z.custom<FileUploadThing>())
    .min(1, "At least one image is required"),
  options: z
    .array(
      z.object({
        name: z.string().min(1, "Option name is required"),
        values: z.array(z.string()).min(1, "At least one value is required"),
      })
    )
    .optional()
    .default([]),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required"),
        price: z.string().optional(),
        stock: z.string().min(1, "Stock is required"),
        options: z.array(
          z.object({
            optionName: z.string(),
            value: z.string(),
          })
        ),
      })
    )
    .optional()
    .default([]),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateProductDialog() {
  const [open, setOpen] = useState(false);
  const [productImages, setProductImages] = useState<FileUploadThing[]>([]);
  const { toast } = useToast();
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      brand: "",
      gender: "",
      style: "",
      categoryId: "",
      images: [],
      options: [],
      variants: [],
    },
  });

  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          price: parseFloat(values.price),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const { mutate: createGalleryItem } = useGalleryMutation();
  const { mutate: deleteGalleryItem } = useDeleteGalleryMutation();

  function onSubmit(values: FormValues) {
    // Only validate variants if they exist
    if (values.variants.length > 0 && !validateVariants()) {
      return;
    }
    createProduct(values);
  }

  const addOption = () => {
    const options = form.getValues("options");
    form.setValue("options", [...options, { name: "", values: [""] }]);
  };

  const removeOption = (index: number) => {
    const options = form.getValues("options") || [];
    options.splice(index, 1);
    form.setValue("options", options);
  };

  const addOptionValue = (optionIndex: number) => {
    const options = form.getValues("options") || [];
    const option = options[optionIndex];
    if (option) {
      option.values = option.values || [];
      option.values.push("");
      form.setValue("options", options);
    }
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const options = form.getValues("options") || [];
    const option = options[optionIndex];
    if (option?.values) {
      option.values.splice(valueIndex, 1);
      form.setValue("options", options);
    }
  };

  const generateVariants = () => {
    const options = form.getValues("options") || [];
    if (options.length === 0) {
      toast({
        title: "Error",
        description:
          "Please add at least one option before generating variants",
        variant: "destructive",
      });
      return;
    }

    // Validate that all options have values
    const invalidOptions = options.filter(
      (option) =>
        option.values.length === 0 || option.values.some((v) => !v.trim())
    );
    if (invalidOptions.length > 0) {
      toast({
        title: "Error",
        description: "All options must have at least one value",
        variant: "destructive",
      });
      return;
    }

    // Generate all possible combinations of option values
    const combinations = options.reduce(
      (acc, option) => {
        if (acc.length === 0) {
          return option.values.map((value) => [
            { optionName: option.name, value },
          ]);
        }
        return acc.flatMap((combination) =>
          option.values.map((value) => [
            ...combination,
            { optionName: option.name, value },
          ])
        );
      },
      [] as { optionName: string; value: string }[][]
    );

    // Create variants from combinations
    const variants = combinations.map((combination, index) => ({
      sku: `SKU-${index + 1}`,
      price: form.getValues("price"),
      stock: "0",
      options: combination,
    }));

    form.setValue("variants", variants);
    toast({
      title: "Success",
      description: `Generated ${variants.length} variants`,
    });
  };

  const validateVariants = () => {
    const variants = form.getValues("variants");
    // Skip validation if no variants
    if (variants.length === 0) {
      return true;
    }

    // Validate that all variants have required fields
    const invalidVariants = variants.filter(
      (variant) => !variant.sku || !variant.stock || variant.stock === "0"
    );
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

  const handleImageChange = (
    value: FileUploadThing[],
    newFile?: FileUploadThing
  ) => {
    setProductImages(value);
    form.setValue("images", [...value]);

    // Only create gallery item for new uploads
    if (newFile) {
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

    if (key) {
      deleteGalleryItem(key);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
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
                    <Input {...field} />
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
                    <Textarea {...field} />
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
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter image URL"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          field.onChange([...field.value, value]);
                          e.target.value = "";
                        }
                      }}
                    />
                  </FormControl>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((image, index) => (
                      <div
                        key={index}
                        className="relative size-20 rounded-md border"
                      >
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="size-full rounded-md object-cover"
                        />
                        <button
                          type="button"
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                          onClick={() => {
                            const newImages = [...field.value];
                            newImages.splice(index, 1);
                            field.onChange(newImages);
                          }}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <MultiImageUploader
              onChange={handleImageChange}
              onRemove={handleImageRemove}
              value={productImages}
              maxLimit={10}
            />

            <Card>
              <CardHeader>
                <CardTitle>Product Options</CardTitle>
                <Button type="button" onClick={addOption}>
                  Add Option
                </Button>
              </CardHeader>
              <CardContent>
                {form.watch("options").map((option, optionIndex) => (
                  <div key={optionIndex} className="mb-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`options.${optionIndex}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Option Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeOption(optionIndex)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {option.values.map((_, valueIndex) => (
                        <div
                          key={valueIndex}
                          className="flex items-center gap-2"
                        >
                          <FormField
                            control={form.control}
                            name={`options.${optionIndex}.values.${valueIndex}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() =>
                              removeOptionValue(optionIndex, valueIndex)
                            }
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addOptionValue(optionIndex)}
                      >
                        Add Value
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={generateVariants}>
                  Generate Variants
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
              </CardHeader>
              <CardContent>
                {form.watch("variants").map((variant, variantIndex) => (
                  <div key={variantIndex} className="mb-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`variants.${variantIndex}.sku`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${variantIndex}.price`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${variantIndex}.stock`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {variant.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="text-sm">
                          <span className="font-medium">
                            {option.optionName}:
                          </span>{" "}
                          {option.value}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
