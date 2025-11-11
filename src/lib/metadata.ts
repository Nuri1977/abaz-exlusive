import type { Metadata } from "next";

// Base configuration for the site
export const SITE_CONFIG = {
  name: "Abaz Exclusive",
  description:
    "Premium women's dresses and fashion apparel. Discover elegant cocktail dresses, formal business wear, and casual summer styles.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com",
  ogImage: "/images/og-default.jpg",
  keywords: [
    "women's dresses",
    "designer dresses",
    "luxury evening wear",
    "cocktail dresses",
    "formal dresses",
    "casual dresses",
    "premium fashion",
    "women's apparel",
    "elegant clothing",
    "fashion boutique",
  ],
};

// SEO configuration interface
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

// Generate complete metadata object
export function generateMetadata(config: SEOConfig): Metadata {
  const title = config.title.includes(SITE_CONFIG.name)
    ? config.title
    : `${config.title} | ${SITE_CONFIG.name}`;

  const description = config.description || SITE_CONFIG.description;
  const image = config.image || SITE_CONFIG.ogImage;
  const url = config.canonical || SITE_CONFIG.url;

  return {
    title,
    description,
    keywords: config.keywords?.join(", ") || SITE_CONFIG.keywords.join(", "),
    authors: config.authors?.map((name) => ({ name })),
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    robots: {
      index: !config.noIndex,
      follow: !config.noIndex,
      googleBot: {
        index: !config.noIndex,
        follow: !config.noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: config.type === "product" ? "website" : config.type || "website",
      locale: "en_US",
      url,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(config.type === "article" && {
        publishedTime: config.publishedTime,
        modifiedTime: config.modifiedTime,
        section: config.section,
        authors: config.authors,
        tags: config.tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@abazexclusive", // Update with actual Twitter handle
    },
    alternates: {
      canonical: url,
    },
    category: "fashion",
  };
}

// Homepage metadata
export function generateHomepageMetadata(): Metadata {
  return generateMetadata({
    title: "Premium Women's Dresses & Fashion Apparel",
    description:
      "Discover Abaz Exclusive's collection of elegant women's dresses. From cocktail dresses to formal wear and casual styles. Premium quality, designer fashion.",
    keywords: [
      ...SITE_CONFIG.keywords,
      "women's fashion boutique",
      "online dress store",
      "premium clothing",
      "designer apparel",
    ],
    canonical: SITE_CONFIG.url,
  });
}

// Product metadata generator
export function generateProductMetadata(product: {
  title: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  slug: string;
  category?: string;
  inStock: boolean;
}): Metadata {
  const title = `${product.title} - Premium Women's Dress`;
  const description = product.description
    ? `${product.description.substring(0, 150)}... Available for ${product.price} ${product.currency}. ${product.inStock ? "In stock" : "Limited availability"}.`
    : `Elegant ${product.title} from Abaz Exclusive. Premium women's dress available for ${product.price} ${product.currency}.`;

  return generateMetadata({
    title,
    description,
    keywords: [
      product.title.toLowerCase(),
      "women's dress",
      product.category?.toLowerCase() || "fashion",
      "designer dress",
      "premium apparel",
      "elegant clothing",
    ],
    image: product.image,
    canonical: `${SITE_CONFIG.url}/products/${product.slug}`,
    type: "product",
  });
}

// Collection metadata generator
export function generateCollectionMetadata(collection: {
  name: string;
  description?: string;
  image?: string;
  slug: string;
  productCount?: number;
}): Metadata {
  const title = `${collection.name} Collection - Women's Dresses`;
  const description = collection.description
    ? `${collection.description} Explore ${collection.productCount || "our"} premium women's dresses in the ${collection.name} collection.`
    : `Discover the ${collection.name} collection of premium women's dresses at Abaz Exclusive. Elegant, designer fashion for every occasion.`;

  return generateMetadata({
    title,
    description,
    keywords: [
      collection.name.toLowerCase(),
      "women's dress collection",
      "designer dresses",
      "fashion collection",
      "premium apparel",
      "elegant dresses",
    ],
    image: collection.image,
    canonical: `${SITE_CONFIG.url}/collections/${collection.slug}`,
  });
}

// Category metadata generator
export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  slug: string;
  productCount?: number;
}): Metadata {
  const title = `${category.name} Dresses - Women's Fashion`;
  const description = category.description
    ? `${category.description} Shop ${category.productCount || "our selection of"} ${category.name.toLowerCase()} dresses.`
    : `Shop premium ${category.name.toLowerCase()} dresses at Abaz Exclusive. Elegant women's fashion for every occasion.`;

  return generateMetadata({
    title,
    description,
    keywords: [
      `${category.name.toLowerCase()} dresses`,
      "women's fashion",
      "designer apparel",
      "premium dresses",
      "elegant clothing",
    ],
    canonical: `${SITE_CONFIG.url}/categories/${category.slug}`,
  });
}

// Blog/Article metadata generator
export function generateArticleMetadata(article: {
  title: string;
  description: string;
  image?: string;
  slug: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  category: string;
  tags?: string[];
}): Metadata {
  return generateMetadata({
    title: `${article.title} - Fashion Guide`,
    description: article.description,
    keywords: [
      ...(article.tags || []),
      "fashion guide",
      "style tips",
      "women's fashion",
      "dress styling",
    ],
    image: article.image,
    canonical: `${SITE_CONFIG.url}/blog/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt.toISOString(),
    modifiedTime: article.updatedAt?.toISOString(),
    authors: [article.author],
    section: article.category,
    tags: article.tags,
  });
}

// Search results metadata
export function generateSearchMetadata(
  query: string,
  resultCount?: number
): Metadata {
  const title = `Search Results for "${query}" - Women's Dresses`;
  const description = resultCount
    ? `Found ${resultCount} results for "${query}". Discover premium women's dresses and fashion apparel at Abaz Exclusive.`
    : `Search results for "${query}". Find the perfect women's dress from our premium collection.`;

  return generateMetadata({
    title,
    description,
    keywords: [
      query,
      "women's dresses",
      "fashion search",
      "dress finder",
      "premium apparel",
    ],
    canonical: `${SITE_CONFIG.url}/search?q=${encodeURIComponent(query)}`,
    noIndex: true, // Don't index search result pages
  });
}

// Error page metadata
export function generateErrorMetadata(errorCode: number): Metadata {
  const titles = {
    404: "Page Not Found - Abaz Exclusive",
    500: "Server Error - Abaz Exclusive",
    403: "Access Denied - Abaz Exclusive",
  };

  const descriptions = {
    404: "The page you're looking for doesn't exist. Explore our collection of premium women's dresses instead.",
    500: "We're experiencing technical difficulties. Please try again later or browse our dress collection.",
    403: "You don't have permission to access this page. Return to our homepage to shop women's dresses.",
  };

  return generateMetadata({
    title: titles[errorCode as keyof typeof titles] || "Error - Abaz Exclusive",
    description:
      descriptions[errorCode as keyof typeof descriptions] ||
      "An error occurred. Please try again.",
    noIndex: true,
  });
}

// Utility function to extract keywords from text
export function extractKeywords(
  text: string,
  maxKeywords: number = 10
): string[] {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
  ]);

  const wordCounts = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))
    .reduce((acc: { [key: string]: number }, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}
