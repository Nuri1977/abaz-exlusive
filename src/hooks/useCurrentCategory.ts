import { usePathname, useSearchParams } from "next/navigation";
import type { Product } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export function useCurrentCategory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("category");

  // If we're on a product page, we need to fetch the product first to get its category
  const isProductPage = pathname?.startsWith("/product/");
  const productSlug = isProductPage ? pathname?.split("/").pop() : null;

  const { data: product } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: async () => {
      if (!productSlug) return null;
      const response = await fetch(`/api/product/${productSlug}`);
      if (!response.ok) return null;
      const result = (await response.json()) as { data: Product };
      return result?.data ?? null;
    },
    enabled: !!productSlug,
  });

  // Now fetch the category based on either the search params or product's category
  const { data: category, isLoading } = useQuery({
    queryKey: ["current-category", categoryId || product?.categoryId],
    queryFn: async () => {
      const id = categoryId || product?.categoryId;
      if (!id) return null;
      const response = await fetch(`/api/categories/current?categoryId=${id}`);
      if (!response.ok) return null;
      const result = (await response.json()) as unknown;
      return result;
    },
    enabled: !!(categoryId || product?.categoryId),
  });

  return {
    category,
    isLoading,
  };
}
