import { z } from "zod";
import { imageSchema, timestampsSchema } from "./common";
import type { FileUploadThing } from "@/types/UploadThing";

// Schema for creating/editing a category
export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.custom<FileUploadThing>().nullable(),
});

// Form schema with parentId for creating nested categories
export const createCategoryFormSchema = categoryFormSchema.extend({
  parentId: z.string().optional(),
});

// Complete category schema including database fields
export const categorySchema = categoryFormSchema
  .extend({
    id: z.string(),
    slug: z.string(),
    parentId: z.string().nullable(),
  })
  .merge(timestampsSchema);

// Export types
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type CreateCategoryFormValues = z.infer<typeof createCategoryFormSchema>;
export type Category = z.infer<typeof categorySchema>;