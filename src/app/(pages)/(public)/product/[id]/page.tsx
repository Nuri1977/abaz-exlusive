import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductPageClient from "./_components/ProductPageClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for product pages
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        variants: {
          include: {
            options: {
              include: {
                optionValue: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return {
        title: "Product Not Found - Abaz Exclusive",
        description: "The product you're looking for doesn't exist. Explore our collection of premium women's dresses.",
        robots: { index: false, follow: false },
      };
    }

    // Get the first available image
    let productImage = "/images/og-default.jpg";
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
        productImage = (firstImage as { url: string }).url || "/images/og-default.jpg";
      }
    }

    // Check if product has variants and get price range
    const hasVariants = product.variants && product.variants.length > 0;
    let priceInfo = `${Number(product.price).toFixed(2)} MKD`;

    if (hasVariants) {
      const prices = product.variants.map(v => Number(v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice !== maxPrice) {
        priceInfo = `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} MKD`;
      } else {
        priceInfo = `${minPrice.toFixed(2)} MKD`;
      }
    }

    // Generate enhanced description
    let description = product.description || `Elegant ${product.name} from Abaz Exclusive.`;
    description += ` Available for ${priceInfo}.`;

    if (product.category?.name) {
      description += ` Part of our ${product.category.name} collection.`;
    }

    if (product.material) {
      description += ` Made with ${product.material}.`;
    }

    // Generate keywords
    const keywords = [
      product.name.toLowerCase(),
      "women's dress",
      product.category?.name?.toLowerCase() || "fashion",
      "designer dress",
      "premium apparel",
      "elegant clothing",
      ...(product.brand ? [product.brand.toLowerCase()] : []),
      ...(product.style ? [product.style.toLowerCase()] : []),
      ...(product.material ? [product.material.toLowerCase()] : []),
      ...(product.collection?.name ? [product.collection.name.toLowerCase()] : []),
    ].filter(Boolean);

    return {
      title: `${product.name} - Premium Women's Dress | Abaz Exclusive`,
      description: description.substring(0, 160), // SEO optimal length
      keywords: keywords,
      openGraph: {
        title: `${product.name} - Premium Women's Dress`,
        description: description.substring(0, 160),
        images: [
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            url: productImage,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - Premium Women's Dress`,
        description: description.substring(0, 160),
        images: [productImage],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"}/product/${product.id}`,
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);

    // Fallback metadata
    return {
      title: "Premium Women's Dress - Abaz Exclusive",
      description: "Discover elegant women's dresses at Abaz Exclusive. Premium quality designer fashion.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductPageClient id={id} />;
}
