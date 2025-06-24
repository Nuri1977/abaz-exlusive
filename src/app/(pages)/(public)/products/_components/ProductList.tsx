"use client";

import { Suspense, useEffect } from "react";
import { Category } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { ProductExt } from "@/types/product";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ProductCard } from "@/components/shared/ProductCard";

import { ProductSkeleton } from "./ProductSkeleton";

interface ProductListProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

type ProductWithCategory = ProductExt & {
  category: Category;
};

function ProductListContent({ searchParams }: ProductListProps) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["products", searchParams],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set("page", pageParam?.toString());
      params.set("limit", "12");

      // Handle all search params except sort which needs special handling
      Object.entries(searchParams).forEach(([key, value]) => {
        if (
          value &&
          key !== "sort" &&
          key !== "status" &&
          key !== "value" &&
          key !== "_response" &&
          key !== "_debugInfo"
        ) {
          if (Array.isArray(value)) {
            params?.set(key, value[0] ?? "");
          } else {
            params?.set(key, value);
          }
        }
      });

      // Handle sort parameter separately to construct proper orderBy object
      const sortParam = searchParams?.sort?.toString() || "createdAt:desc";
      const [sortField, sortOrder] = sortParam?.split(":") as [
        string,
        "asc" | "desc",
      ];

      // Add sort parameters if they are valid
      if (sortField && sortOrder) {
        params?.set("sort", `${sortField}:${sortOrder}`);
      }

      const response = await fetch(`/api/products?${params}`);
      if (!response?.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response?.json();
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage?.pagination?.nextPage;
      }
      return undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Failed to load products</p>
      </div>
    );
  }

  if (!data?.pages[0]?.products?.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.pages?.map((page) =>
          page?.products?.map((product: ProductWithCategory) => (
            <ProductCard key={product?.id} product={product} />
          ))
        )}
      </div>
      <div ref={ref} className="flex items-center justify-center py-8">
        {isFetchingNextPage && <Loader2 className="size-8 animate-spin" />}
      </div>
    </div>
  );
}

export function ProductList(props: ProductListProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductListContent {...props} />
    </Suspense>
  );
}
