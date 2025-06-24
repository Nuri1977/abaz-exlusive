import { z } from "zod";
import { imageSchema, timestampsSchema } from "./common";
import type { FileUploadThing } from "@/types/UploadThing";

// Base schema for category properties
const categoryBaseSchema = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.custom<FileUploadThing>().nullable(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
} as const;

// Schema for creating/editing a category
export const categoryFormSchema = z.object(categoryBaseSchema);

// Form schema for creating categories (same as base schema)
export const createCategoryFormSchema = categoryFormSchema;

// Complete category schema including database fields
export const categorySchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      ...categoryBaseSchema,
      id: z.string(),
      slug: z.string(),
      level: z.number(),
      children: z.array(categorySchema).optional(),
      parent: categorySchema.nullable().optional(),
    })
    .merge(timestampsSchema)
);

// Export types
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type CreateCategoryFormValues = z.infer<typeof createCategoryFormSchema>;
export type Category = z.infer<typeof categorySchema>;