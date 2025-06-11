"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, X, Loader2 } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  brand: z.string().min(1, "Brand is required"),
  gender: z.string().min(1, "Gender is required"),
  style: z.string().min(1, "Style is required"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  options: z.array(
    z.object({
      name: z.string().min(1, "Option name is required"),
      values: z.array(z.string()).min(1, "At least one value is required"),
    })
  ),
  variants: z.array(
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
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateProductDialog() {
  const [open, setOpen] = useState(false);
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

  function onSubmit(values: FormValues) {
    if (!validateVariants()) {
      return;
    }
    createProduct(values);
  }

  const addOption = () => {
    const options = form.getValues("options");
    form.setValue("options", [...options, { name: "", values: [""] }]);
  };

  const removeOption = (index: number) => {
    const options = form.getValues("options");
    options.splice(index, 1);
    form.setValue("options", options);
  };

  const addOptionValue = (optionIndex: number) => {
    const options = form.getValues("options");
    options[optionIndex].values.push("");
    form.setValue("options", options);
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const options = form.getValues("options");
    options[optionIndex].values.splice(valueIndex, 1);
    form.setValue("options", options);
  };

  const generateVariants = () => {
    const options = form.getValues("options");
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
    if (variants.length === 0) {
      toast({
        title: "Error",
        description: "Please generate variants before creating the product",
        variant: "destructive",
      });
      return false;
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
            <FormField
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-20 h-20 border rounded-md"
                      >
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          onClick={() => {
                            const newImages = [...field.value];
                            newImages.splice(index, 1);
                            field.onChange(newImages);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
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
                  <div key={optionIndex} className="space-y-4 mb-4">
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
                        <X className="h-4 w-4" />
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
                            <X className="h-4 w-4" />
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
                  <div key={variantIndex} className="space-y-4 mb-4">
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
