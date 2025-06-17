// Static site generation SSG with untable cache and revalidation
// Server side rendering SSR

import { queryKeys } from "@/config/tanstackConfig";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getUsersSSG = unstable_cache(async () => {
  const response = await prisma.user.findMany({
    // sort by createdAt in descending order
    orderBy: {
      createdAt: "desc",
    },
  });
  return response;
}, [queryKeys.users, queryKeys.all]);
