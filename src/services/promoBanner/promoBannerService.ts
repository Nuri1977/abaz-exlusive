import type { Collection, PromoBanner } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type PromoBannerData = PromoBanner & {
  collection: Collection | null;
};

export const promoBannerService = {
  // Get current promo banner with collection data
  async getPromoBanner(): Promise<PromoBannerData | null> {
    try {
      const promoBanner = await prisma.promoBanner.findFirst({
        where: {
          isActive: true,
        },
        include: {
          collection: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return promoBanner;
    } catch (error) {
      console.error("Error fetching promo banner:", error);
      throw new Error("Failed to fetch promo banner");
    }
  },

  // Update promo banner (create if doesn't exist)
  async updatePromoBanner(
    collectionId: string | null
  ): Promise<PromoBannerData> {
    try {
      // First, deactivate any existing promo banners
      await prisma.promoBanner.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // If collectionId is null, just return null (no active promo banner)
      if (!collectionId) {
        // Return a mock object to satisfy the return type
        return {
          id: "",
          collectionId: null,
          collection: null,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Create or update promo banner with the new collection
      const promoBanner = await prisma.promoBanner.upsert({
        where: {
          collectionId: collectionId,
        },
        update: {
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          collectionId: collectionId,
          isActive: true,
        },
        include: {
          collection: true,
        },
      });

      return promoBanner;
    } catch (error) {
      console.error("Error updating promo banner:", error);
      throw new Error("Failed to update promo banner");
    }
  },

  // Clear promo banner (set to inactive)
  async clearPromoBanner(): Promise<void> {
    try {
      await prisma.promoBanner.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      console.error("Error clearing promo banner:", error);
      throw new Error("Failed to clear promo banner");
    }
  },

  // Get all collections for selection
  async getAvailableCollections(): Promise<Collection[]> {
    try {
      const collections = await prisma.collection.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return collections;
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw new Error("Failed to fetch collections");
    }
  },
};
