"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { ProductSort } from "./ProductSort";
import { Loader2 } from "lucide-react";

interface ProductListProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductList({ searchParams }: ProductListProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["products", searchParams],
      initialPageParam: 1,
      queryFn: async ({ pageParam = 1 }) => {
        const params = new URLSearchParams();
        params.set("page", pageParam.toString());
        params.set("limit", "12");

        // Handle all search params
        Object.entries(searchParams).forEach(([key, value]) => {
          if (
            value &&
            key !== "status" &&
            key !== "value" &&
            key !== "_response" &&
            key !== "_debugInfo"
          ) {
            if (Array.isArray(value)) {
              params.set(key, value[0]);
            } else {
              params.set(key, value);
            }
          }
        });

        console.log("Fetching products with params:", params.toString());

        const response = await fetch(`/api/products?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        console.log("Received products:", data.products.length);
        return data;
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.hasMore) {
          return lastPage.pagination.nextPage;
        }
        return undefined;
      },
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "error") {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load products</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <ProductSort />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((page) =>
          page.products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
      <div ref={ref} className="flex justify-center items-center py-8">
        {isFetchingNextPage && <Loader2 className="h-8 w-8 animate-spin" />}
      </div>
    </div>
  );
}
