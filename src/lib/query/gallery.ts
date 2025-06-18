import { Gallery } from "@prisma/client";
import axios from "axios";

export interface GalleryImage extends Gallery {
  // No need to redefine fields as they're already defined in the Gallery type from @prisma/client
}

export interface PaginatedGalleryResponse {
  items: GalleryImage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const fetchGalleryItems = ({ 
  page = 1, 
  limit = 12 
}: { 
  page?: number; 
  limit?: number; 
} = {}) => {
  return axios.get<PaginatedGalleryResponse>(`/api/admin/gallery?page=${page}&limit=${limit}`).then((res) => res.data);
};

export const createGalleryItem = (galleryItem: Omit<Gallery, "id" | "createdAt" | "updatedAt">) => {
  return axios.post<Gallery>("/api/admin/gallery", galleryItem).then((res) => res.data);
};

export const deleteGalleryItem = (id: string) => {
  return axios.delete(`/api/admin/gallery/${id}`).then((res) => res.data);
};
