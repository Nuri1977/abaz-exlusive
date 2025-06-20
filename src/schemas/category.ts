import { z } from "zod";
import { imageSchema, timestampsSchema } from "./common";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: imageSchema.nullable(),
});

export const categorySchema = categoryFormSchema
  .extend({
    id: z.string(),
    slug: z.string(),
    parentId: z.string().nullable(),
  })
  .merge(timestampsSchema);

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type Category = z.infer<typeof categorySchema>;