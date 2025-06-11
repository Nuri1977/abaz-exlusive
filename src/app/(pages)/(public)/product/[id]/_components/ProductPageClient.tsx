"use client";

import api, { ApiResponse } from "@/lib/axios";
import { Product } from "@prisma/client";
import { queryKeys } from "@/config/constants";
import { useQuery } from "@tanstack/react-query";
import ProductImageGallery from "./ProductImageGallery";
import { Button } from "@/components/ui/button";

export default function ProductPageClient({ id }: { id: string }) {
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [queryKeys.products, id],
    queryFn: async () => {
      const res = await api.get<Product>(`/product/${id}`);
      return res ?? null;
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    const isNotFound = (error as any)?.response?.status === 404;
    if (isNotFound) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="text-gray-600">The product you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="text-gray-600">Please try again later.</p>
            </div>
          </div>
        </div>
      );
    }
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product data is missing.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:sticky md:top-4">
          <ProductImageGallery images={product.images} />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>

          <div className="flex items-center space-x-2">
            <span className="text-3xl font-semibold">${+product.price}</span>
          </div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="pt-4">
            <Button>Add to Cart</Button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.brand && (
                <div>
                  <h3 className="font-medium">Brand</h3>
                  <p className="text-gray-600 capitalize">{product.brand}</p>
                </div>
              )}
              {product.gender && (
                <div>
                  <h3 className="font-medium">Gender</h3>
                  <p className="text-gray-600 capitalize">{product.gender}</p>
                </div>
              )}
              {product.style && (
                <div>
                  <h3 className="font-medium">Style</h3>
                  <p className="text-gray-600 capitalize">{product.style}</p>
                </div>
              )}
              {product.material && (
                <div>
                  <h3 className="font-medium">Material</h3>
                  <p className="text-gray-600 capitalize">{product.material}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
