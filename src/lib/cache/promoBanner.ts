import { unstable_cache } from "next/cache";

import {
  promoBannerService,
  type PromoBannerData,
} from "@/services/promoBanner/promoBannerService";

export const SSGCacheKeys = {
  promoBanner: "promo-banner",
} as const;

export const getCachedPromoBanner = unstable_cache(
  async (): Promise<PromoBannerData | null> => {
    return await promoBannerService.getPromoBanner();
  },
  ["promo-banner"],
  {
    tags: [SSGCacheKeys.promoBanner],
  }
);
