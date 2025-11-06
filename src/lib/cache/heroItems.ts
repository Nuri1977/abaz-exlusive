import { unstable_cache } from "next/cache";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { heroItemService } from "@/services/heroItems/heroItemService";

export const getCachedHeroItems = unstable_cache(
  async () => {
    try {
      return await heroItemService.getActiveHeroItems();
    } catch (error) {
      console.error("Failed to fetch hero items:", error);
      return [];
    }
  },
  [SSGCacheKeys.heroItems],
  {
    tags: [SSGCacheKeys.heroItems],
  }
);
