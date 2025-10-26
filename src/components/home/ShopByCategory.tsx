import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

import type { FileUploadThing } from "@/types/UploadThing";
import getCategoriesSSG from "@/services/categories/categoriesService";

type CategoryWithChildren = Prisma.CategoryGetPayload<{
  include: {
    children: true;
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

const ShopByCategory = async () => {
  const categories = await getCategoriesSSG();

  // Transform the data to match our needs
  const transformedCategories = categories.map((category: CategoryWithChildren) => ({
    id: category?.id,
    name: category?.name,
    slug: category?.slug,
    image: category?.image as FileUploadThing | null,
    productCount: category?._count?.products || 0,
  }));

  // Filter out categories without images for the homepage display
  const categoriesWithImages = transformedCategories.filter(
    (category) => category?.image?.url
  );

  if (categoriesWithImages.length === 0) {
    return null;
  }

  return (
    <section className="px-4">
      <h2 className="mb-10 text-center text-3xl font-bold">Shop by Category</h2>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6">
        {categoriesWithImages.map((category) => (
          <Link
            href={`/products?category=${category?.id}`}
            key={category?.id}
            className="group flex flex-col items-center"
          >
            <div className="mb-3 size-32 overflow-hidden rounded-full border-4 border-tertiary transition-transform group-hover:scale-105 md:size-40">
              {category?.image?.url && (
                <Image
                  src={category.image.url}
                  alt={category?.name || "Category"}
                  width={160}
                  height={160}
                  className="size-full object-cover"
                  priority={false}
                />
              )}
            </div>
            <span className="text-center font-medium">{category?.name}</span>
            {category?.productCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {category.productCount} products
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByCategory;
