import "server-only";

import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { prisma } from "@/lib/prisma";

type CollectionWithCount = Prisma.CollectionGetPayload<{
  include: {
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

const getCollectionsData = async (): Promise<CollectionWithCount[]> => {
  try {
    const response = await prisma.collection.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
};

export const getCollectionsSSG = unstable_cache(
  getCollectionsData,
  [SSGCacheKeys.collections],
  {
    tags: [SSGCacheKeys.collections],
  }
);

// Also export as default for compatibility
export default getCollectionsSSG;
