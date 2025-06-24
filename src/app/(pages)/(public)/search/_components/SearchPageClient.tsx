"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";

import type { ProductExt } from "@/types/product";
import { productKeys, searchProducts } from "@/lib/query/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ProductCard } from "@/app/(pages)/(public)/products/_components/ProductCard";

import { ProductSkeleton } from "./ProductSkeleton";

type ProductWithCategory = ProductExt & {
  category: Category;
};

export function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams?.get("q") || "");
  const [submittedQuery, setSubmittedQuery] = useState(
    searchParams?.get("q") || ""
  );
  const [page, setPage] = useState(1);

  // Update search input when URL changes
  useEffect(() => {
    const query = searchParams?.get("q") || "";
    setSearchInput(query);
    setSubmittedQuery(query);
  }, [searchParams]);

  const handleSearch = useCallback(() => {
    const trimmedQuery = searchInput.trim();
    const params = new URLSearchParams(searchParams?.toString());
    if (trimmedQuery) {
      params?.set("q", trimmedQuery);
    } else {
      params?.delete("q");
    }
    router.replace(`${pathname}?${params?.toString()}`);
    setSubmittedQuery(trimmedQuery);
    setPage(1);
  }, [searchInput, pathname, router, searchParams]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  const { data, isLoading } = useQuery({
    queryKey: productKeys.search(submittedQuery, page),
    queryFn: () => searchProducts(submittedQuery, page),
    enabled: !!submittedQuery,
  });

  return (
    <main className="flex-1 pb-16">
      <div className="border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="pb-4">
          <form onSubmit={onSubmit} className="relative max-w-xl">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="h-10 pr-24 text-lg"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <kbd className="pointer-events-none absolute right-14 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              press ↵ to search
            </kbd>
          </form>
          {data?.pagination?.total ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Showing <strong>{data?.pagination?.total}</strong> results
            </p>
          ) : null}
        </div>

        {!submittedQuery ? (
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
