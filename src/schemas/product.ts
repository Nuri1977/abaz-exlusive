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
  compareAtPrice: priceSchema.or(z.literal("")).optional(),
  stock: z.string().min(1, "Stock is required"),
  options: z.array(productOptionValueSchema),
  images: z.array(imageSchema).optional().default([]),
});

// Base product form schema
export const baseProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: priceSchema,
  compareAtPrice: priceSchema.or(z.literal("")).optional(),
  brand: z.string().min(1, "Brand is required"),
  material: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  style: z.string().min(1, "Style is required"),
  categoryId: z.string().min(1, "Category is required"),
  collectionId: z.string().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(imageSchema).min(1, "At least one image is required"),
});

// Add product form schema (includes options and variants)
export const addProductFormSchema = baseProductFormSchema.extend({
  options: z.array(productOptionSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
});

// Edit product form schema (now identical to add product form)
export const editProductFormSchema = addProductFormSchema;

// Complete product schema including database fields
export const productSchema = baseProductFormSchema
  .extend({
    id: z.string(),
    slug: z.string(),
    variants: z.array(productVariantSchema).optional(),
  })
  .merge(timestampsSchema);

// Export types
export type BaseProductFormValues = z.infer<typeof baseProductFormSchema>;
export type AddProductFormValues = z.infer<typeof addProductFormSchema>;
export type EditProductFormValues = z.infer<typeof editProductFormSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Product = z.infer<typeof productSchema>;
