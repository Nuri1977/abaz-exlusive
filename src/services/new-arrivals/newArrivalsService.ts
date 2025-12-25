import "server-only";

import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { prisma } from "@/lib/prisma";

type NewArrivalWithProduct = Prisma.NewArrivalsGetPayload<{
  include: {
    product: {
      include: {
        category: true;
      };
    };
  };
}>;

export const getNewArrivalsSSG = unstable_cache(
  async (): Promise<NewArrivalWithProduct[]> => {
    let products: NewArrivalWithProduct[] = [];
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
