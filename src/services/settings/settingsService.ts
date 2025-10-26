import "server-only";

import { unstable_cache } from "next/cache";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { prisma } from "@/lib/prisma";

export const getSettingsSA = unstable_cache(
  async () => {
    let settings = null;
    try {
      settings = await prisma.settings.findFirst();
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
    return settings;
  },
  [SSGCacheKeys.settings],
  {
    tags: [SSGCacheKeys.settings],
  }
);
