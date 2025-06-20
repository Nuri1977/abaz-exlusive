import { z } from "zod";
import type { FileUploadThing } from "@/types/UploadThing";

export const timestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const imageSchema = z.custom<FileUploadThing>();

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
});

export const priceSchema = z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format");