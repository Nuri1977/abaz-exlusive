import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shared/ProductCard";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;

  const collection = await prisma.collection.findUnique({
    where: { slug, isActive: true },
  });

  if (!collection) {
    return {
      title: "Collection Not Found | Abaz Exclusive",
    };
  }

  return {
    title: `${collection.name} | Abaz Exclusive`,
    description: collection.description || `Explore our ${collection.name} collection of premium footwear`,
  };
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
  }));

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Collection Header - VloraKaltrina Style */}
      <div className="mb-16 text-center">
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-12">
          {serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
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