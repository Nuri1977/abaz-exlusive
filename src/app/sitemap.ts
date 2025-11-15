import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URLs with high priority
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.url}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.url}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_CONFIG.url}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_CONFIG.url}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_CONFIG.url}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    // Fetch active products
    const products = await prisma.product.findMany({
      where: {
        // Products don't have isActive field, so fetch all
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Fetch active collections
    const collections = await prisma.collection.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Generate product URLs
    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_CONFIG.url}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Generate collection URLs
    const collectionUrls: MetadataRoute.Sitemap = collections.map(
      (collection) => ({
        url: `${SITE_CONFIG.url}/collections/${collection.slug}`,
        lastModified: collection.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    );

    // Combine all URLs
    return [...baseUrls, ...productUrls, ...collectionUrls];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return base URLs if database query fails
    return baseUrls;
  }
}
