import { Suspense } from "react";
import { ProductList } from "./_components/ProductList";
import { ProductFilters } from "./_components/ProductFilters";
import { ProductSkeleton } from "./_components/ProductSkeleton";

export const metadata = {
  title: "Shop | Molini Shoes",
  description: "Browse our collection of high-quality shoes",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  console.log("Search params:", params);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop</h1>
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
