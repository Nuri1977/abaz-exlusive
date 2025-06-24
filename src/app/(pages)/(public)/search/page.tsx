"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";

import type { ProductExt } from "@/types/product";
import { productKeys, searchProducts } from "@/lib/query/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/app/(pages)/(public)/products/_components/ProductCard";

import { ProductSkeleton } from "./_components/ProductSkeleton";

type ProductWithCategory = ProductExt & {
  category: Category;
};

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [page, setPage] = useState(1);

  // Update search input when URL changes
  useEffect(() => {
    setSearchInput(searchParams?.get("q") || "");
  }, [searchParams]);

  // Handle search input changes
  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value) {
      params?.set("q", value);
    } else {
      params?.delete("q");
    }
    // Use replace to avoid adding to history stack
    router.replace(`${pathname}?${params?.toString()}`);
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const { data, isLoading } = useQuery({
    queryKey: productKeys.search(query, page),
    queryFn: () => searchProducts(query, page),
    enabled: !!query,
  });

  return (
    <main className="flex-1 pb-16">
      <div className="border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-4 py-8">
        <div>
          <form onSubmit={onSubmit} className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="h-14 pl-10 pr-4 text-lg"
            />
          </form>
          {data?.pagination?.total ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Showing <strong>{data?.pagination?.total}</strong> results
            </p>
          ) : null}
        </div>

        {!query ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-2xl font-bold">Search Products</h2>
            <p className="mt-2 text-muted-foreground">
              Enter a search term to find products
            </p>
          </Card>
        ) : isLoading ? (
          <ProductSkeleton />
        ) : data?.products?.length === 0 ? (
          <Card className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-2xl font-bold">No products found</h2>
            <p className="mt-2 text-muted-foreground">
              Try searching with different keywords
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.products?.map((product: ProductWithCategory) => (
                <ProductCard key={product?.id} product={product} />
              ))}
            </div>

            {data?.pagination?.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data?.pagination?.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(data?.pagination?.pages, p + 1))
                  }
                  disabled={page === data?.pagination?.pages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
