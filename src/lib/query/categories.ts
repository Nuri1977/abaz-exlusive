import type { Category } from "@prisma/client";
import type { FileUploadThing } from "@/types/UploadThing";
import axios from "axios";

export type CategoryWithRelations = Category & {
  image: FileUploadThing | null;
  parent: CategoryWithRelations | null;
  children: CategoryWithRelations[];
};

export const categoryKeys = {
  all: ["categories"] as const,
  admin: () => [...categoryKeys.all, "admin"] as const,
  public: () => [...categoryKeys.all, "public"] as const,
};

export const fetchAdminCategories = async () => {
  const { data } = await axios.get<CategoryWithRelations[]>("/api/admin/categories");
  return data;
};

export const fetchPublicCategories = async () => {
  const { data } = await axios.get<CategoryWithRelations[]>("/api/categories");
  return data;
};