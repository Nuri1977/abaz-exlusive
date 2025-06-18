// create react query wrpapper for gallery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGalleryItems, createGalleryItem, deleteGalleryItem } from "../lib/query/gallery";
import type { PaginatedGalleryResponse } from "../lib/query/gallery";

export const galleryKeys = {
  all: ["gallery"] as const,
  lists: () => [...galleryKeys.all, "list"] as const,
  list: (page: number, limit: number) => 
    [...galleryKeys.lists(), { page, limit }] as const,
};

export function useGalleryQuery(page: number = 1, limit: number = 12) {
  return useQuery<PaginatedGalleryResponse>({
    queryKey: galleryKeys.list(page, limit),
    queryFn: () => fetchGalleryItems({ page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const useGalleryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createGalleryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
        },
    });
};

export const useDeleteGalleryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGalleryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
        },
    });
};