import "server-only";

import { unstable_cache } from "next/cache";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { prisma } from "@/lib/prisma";

export const getNewArrivalsSSG = unstable_cache(
  async () => {
    let products: unknown[] = [];
    try {
      const response = await prisma.newArrivals.findMany({
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
      if (response) {
        products = response;
      }
    } catch (error) {
      console.log(error);
    }
    return products;
  },
  [SSGCacheKeys.newArrivals],
  {
    tags: [SSGCacheKeys.newArrivals],
  }
);

// Also export as default for compatibility
export default getNewArrivalsSSG;
