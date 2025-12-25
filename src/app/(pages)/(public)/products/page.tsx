import { Suspense } from "react";
import type { Metadata } from "next";

import { generateProductsListingMetadata } from "@/lib/metadata";
import { CategoryBreadcrumb } from "@/components/shared/CategoryBreadcrumb";

import { CategoryNav } from "./_components/CategoryNav";
import { ProductFilters } from "./_components/ProductFilters";
import { ProductList } from "./_components/ProductList";
import { ProductSkeleton } from "./_components/ProductSkeleton";
import { ProductSort } from "./_components/ProductSort";

// Generate SEO metadata for Products listing page
export const metadata: Metadata = generateProductsListingMetadata();

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 pb-4 pt-1 md:py-8">
      <div className="mb-2 md:mb-4">
        <CategoryBreadcrumb />
      </div>

      {/* Category Navigation */}
      <div className="mb-4">
        <CategoryNav />
      </div>

      {/* Mobile: Filter and Sort in one row */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:hidden">
        <ProductFilters />
        <ProductSort />
      </div>

      {/* Desktop: Sort aligned to right */}
      <div className="mb-8 hidden md:flex md:justify-end">
        <ProductSort />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Desktop: Filters Sidebar */}
        <div className="hidden md:col-span-1 md:block">
          <ProductFilters />
        </div>
        
        {/* Product List */}
        <div className="md:col-span-3">
          <Suspense fallback={<ProductSkeleton />}>
            <ProductList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
