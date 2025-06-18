// Static site generation SSG with untable cache and revalidation
// Server side rendering SSR

import { unstable_cache } from "next/cache";

import { queryKeys } from "@/config/tanstackConfig";
import { prisma } from "@/lib/prisma";

export const getUsersSSG = unstable_cache(async () => {
  const response = await prisma.user.findMany({
    // sort by createdAt in descending order
    orderBy: {
      createdAt: "desc",
    },
  });
  return response;
}, [queryKeys.users, queryKeys.all]);
