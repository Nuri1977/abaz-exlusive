import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shared/ProductCard";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;

    const collection = await prisma.collection.findUnique({
      where: { slug, isActive: true },
      include: {
        products: {
          where: {
            category: {
              isActive: true,
            },
          },
          select: {
            id: true,
            name: true,
            price: true,
            category: {
              select: {
                name: true,
              },
            },
          },
          take: 10, // Limit for performance
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      return {
        title: "Collection Not Found - Abaz Exclusive",
        description: "The collection you're looking for doesn't exist. Explore our other premium women's dress collections.",
        robots: { index: false, follow: false },
      };
    }

    // Get collection image
    const collectionImage = collection.image &&
      typeof collection.image === 'object' &&
      collection.image !== null &&
      'url' in collection.image
      ? collection.image.url as string
      : "/images/og-default.jpg";

    // Generate enhanced description
    let description = collection.description || `Discover the ${collection.name} collection of premium women's dresses at Abaz Exclusive.`;

    // Add product count information
    const productCount = collection._count.products;
    if (productCount > 0) {
      description += ` Featuring ${productCount} elegant ${productCount === 1 ? 'dress' : 'dresses'} designed for every occasion.`;
    }

    // Add price range if products exist
    if (collection.products.length > 0) {
      const prices = collection.products
        .map(p => Number(p.price))
        .filter(price => price > 0);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          description += ` Starting at ${minPrice.toFixed(2)} MKD.`;
        } else {
          description += ` Prices from ${minPrice.toFixed(2)} to ${maxPrice.toFixed(2)} MKD.`;
        }
      }
    }

    // Generate keywords from collection and products
    const keywords = [
      collection.name.toLowerCase(),
      "women's dress collection",
      "designer dresses",
      "fashion collection",
      "premium apparel",
      "elegant dresses",
      `${collection.name.toLowerCase()} dresses`,
      // Add category keywords from products
      ...new Set(collection.products
        .map(p => p.category?.name?.toLowerCase())
        .filter(Boolean)
      ),
    ].filter(Boolean);

    // Generate structured data for collection
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${collection.name} Collection`,
      "description": description,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"}/collections/${collection.slug}`,
      "mainEntity": {
        "@type": "ItemList",
        "name": `${collection.name} Dresses`,
        "numberOfItems": productCount,
        "itemListElement": collection.products.slice(0, 5).map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.name,
            "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"}/product/${product.id}`,
            "offers": {
              "@type": "Offer",
              "price": Number(product.price),
              "priceCurrency": "MKD"
            }
          }
        }))
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Collections",
            "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"}/collections`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": collection.name,
            "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"}/collections/${collection.slug}`
          }
        ]
      }
    };

    return {
      title: `${collection.name} Collection - Women's Dresses | Abaz Exclusive`,
      description: description.substring(0, 160), // SEO optimal length
      keywords: keywords,
      openGraph: {
        title: `${collection.name} Collection - Premium Women's Dresses`,
        description: description.substring(0, 160),
        images: [
          {
            url: collectionImage,
            width: 1200,
            height: 630,
            alt: `${collection.name} Collection - Abaz Exclusive`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${collection.name} Collection - Premium Women's Dresses`,
        description: description.substring(0, 160),
        images: [collectionImage],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"}/collections/${collection.slug}`,
      },
      other: {
        // Add structured data for better SEO
        'structured-data': JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    console.error("Error generating collection metadata:", error);

    // Fallback metadata
    return {
      title: "Premium Women's Dress Collection - Abaz Exclusive",
      description: "Discover elegant women's dress collections at Abaz Exclusive. Premium quality designer fashion for every occasion.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  const collection = await prisma.collection.findUnique({
    where: {
      slug,
      isActive: true,
    },
    include: {
      products: {
        where: {
          category: {
            isActive: true,
          },
        },
        include: {
          category: true,
          variants: {
            select: {
              id: true,
              price: true,
              stock: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  // Convert Decimal to number for client components
  const serializedProducts = collection.products.map((product) => ({
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : 0,
    variants: product.variants?.map((variant) => ({
      ...variant,
      price: variant.price ? parseFloat(variant.price.toString()) : null,
    })) || [],
    images: product.images, // Keep original images
  }));

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      {/* Collection Header - VloraKaltrina Style */}
      <div className="mb-8 text-center sm:mb-12 md:mb-16">
        <h1 className="text-4xl font-light uppercase tracking-[0.2em] md:text-5xl lg:text-6xl">
          {collection.name}
        </h1>

        {collection.description && (
          <div className="mx-auto mt-8 max-w-4xl">
            <p className="text-sm leading-relaxed text-gray-600 md:text-base lg:leading-loose">
              {collection.description}
            </p>
          </div>
        )}

        <p className="mt-6 text-xs uppercase tracking-wider text-gray-500">
          {collection._count.products} products
        </p>
      </div>

      {/* Products Grid - Keep existing ProductCard */}
      {serializedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 xl:grid-cols-4">
          {serializedProducts.map((product) => (
            <ProductCard
              key={product.id}
              // @ts-expect-error - Type compatibility issue between Prisma result and ProductExt interface
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-lg text-muted-foreground">
            No products found in this collection.
          </p>
        </div>
      )}
    </div>
  );
}