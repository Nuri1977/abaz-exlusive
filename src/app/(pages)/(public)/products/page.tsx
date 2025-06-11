import { Suspense } from "react";
import { ProductList } from "./_components/ProductList";
import { ProductFilters } from "./_components/ProductFilters";
import { ProductSkeleton } from "./_components/ProductSkeleton";
import { CategoryNav } from "./_components/CategoryNav";
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex-1">
          <CategoryNav />
        </div>
        <div className="ml-4">
          <ProductSort />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <ProductFilters />
        </div>
        <div className="md:col-span-3">
          <Suspense key={JSON.stringify(params)} fallback={<ProductSkeleton />}>
            <ProductList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
