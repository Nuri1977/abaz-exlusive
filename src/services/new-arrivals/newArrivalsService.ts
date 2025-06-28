import "server-only";

import { unstable_cache as cache } from "next/cache";

import { prisma } from "@/lib/prisma";

export const getNewArrivals = cache(
  async () => {
    let projects: any[] = [];
    try {
      const response = await prisma.featuredProject.findMany({
        orderBy: [
          {
            created_at: "desc",
          },
        ],
        include: {
          building: {
            include: {
              realtor: true,
            },
          },
        },
      });
      if (response) {
        projects = response;
      }
    } catch (error) {
      console.log(error);
    }
    return projects;
  },
  ["new-arrivals"],
  { tags: ["new-arrivals", "all-tags"] }
);
