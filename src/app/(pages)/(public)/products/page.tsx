import { Suspense } from "react";

import { CategoryNav } from "./_components/CategoryNav";
import { ProductFilters } from "./_components/ProductFilters";
import { ProductList } from "./_components/ProductList";
import { ProductSkeleton } from "./_components/ProductSkeleton";
import { ProductSort } from "./_components/ProductSort";

export const metadata = {
  title: "Products | Molini Shoes",
  description: "Browse our collection of high-quality shoes",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
        <div className="flex-1">
          <CategoryNav />
        </div>
        <div className="md:ml-4">
          <ProductSort />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <ProductFilters />
        </div>
        <div className="md:col-span-3">
          <Suspense fallback={<ProductSkeleton />}>
            <ProductList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
