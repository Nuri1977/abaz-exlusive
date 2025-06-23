import { z } from "zod";

export const settingsSchema = z.object({
  id: z.string().default("default"),
  name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  telephone: z.string().min(1, "Telephone is required"),
  email: z.string().email("Invalid email format"),
  facebook: z
    .string()
    .url("Invalid Facebook URL")
    .nullable()
    .optional()
    .transform((val) => val || null),
  twitter: z
    .string()
    .url("Invalid Twitter URL")
    .nullable()
    .optional()
    .transform((val) => val || null),
  instagram: z
    .string()
    .url("Invalid Instagram URL")
    .nullable()
    .optional()
    .transform((val) => val || null),
  youtube: z
    .string()
    .url("Invalid YouTube URL")
    .nullable()
    .optional()
    .transform((val) => val || null),
  aboutInfo: z.string().min(1, "About information is required"),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

// Form data schema without date fields
export const settingsFormSchema = settingsSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;