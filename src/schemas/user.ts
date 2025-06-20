import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").nullable(),
  email: z.string().email("Invalid email address"),
  isAdmin: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  image: z.string().url("Invalid image URL").nullable(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;