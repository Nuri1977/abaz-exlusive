import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { prisma } from "@/lib/prisma";

type BestSellerWithProduct = Prisma.BestSellersGetPayload<{
  include: {
    product: {
      include: {
        category: true;
      };
    };
  };
}>;

const getBestSellersData = async (): Promise<BestSellerWithProduct[]> => {
  try {
    const response = await prisma.bestSellers.findMany({
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
    return response;
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
};

export const getBestSellersSSG = unstable_cache(
  getBestSellersData,
  [SSGCacheKeys.bestSellers],
  {
    tags: [SSGCacheKeys.bestSellers],
  }
);

// Also export as default for compatibility
export default getBestSellersSSG;
