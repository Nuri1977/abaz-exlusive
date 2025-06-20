import { z } from "zod";
import { imageSchema, priceSchema, timestampsSchema } from "./common";

// Product option schemas
export const productOptionValueSchema = z.object({
  optionName: z.string(),
  value: z.string(),
});

export const productOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  values: z.array(z.string()).min(1, "At least one value is required"),
});

// Product variant schema
export const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: priceSchema.optional(),
  stock: z.string().min(1, "Stock is required"),
  options: z.array(productOptionValueSchema),
});

// Product form schema (for create/edit)
export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: priceSchema,
  brand: z.string().min(1, "Brand is required"),
  material: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  style: z.string().min(1, "Style is required"),
  categoryId: z.string().min(1, "Category is required"),
  features: z.array(z.string()).optional(),
  images: z.array(imageSchema).min(1, "At least one image is required"),
  options: z.array(productOptionSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
});

// Complete product schema including database fields
export const productSchema = productFormSchema
  .extend({
    id: z.string(),
    slug: z.string(),
  })
  .merge(timestampsSchema);

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Product = z.infer<typeof productSchema>;