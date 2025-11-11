import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/admin-dashboard/",
          "/search?*",
          "/cart",
          "/checkout",
          "/account/",
          "/login",
          "/register",
          "/reset-password",
          "/verify-email",
          "*.json",
          "*.xml",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/admin-dashboard/",
          "/cart",
          "/checkout",
          "/account/",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/admin-dashboard/",
          "/cart",
          "/checkout",
          "/account/",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
