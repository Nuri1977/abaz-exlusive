"use client";

import clsx from "clsx";
import api from "@/lib/axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/config/tanstackConfig";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import ProductWithOptions from "@/types/product";
import ProductPageSkeleton from "./ProductPageSkeleton";
import ProductImageGallery from "./ProductImageGallery";

export default function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [queryKeys.products, id],
    queryFn: async () => {
      const res = await api.get<ProductWithOptions>(`/product/${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
    retry: false,
  });

  const sizeOption = product?.options.find((opt) => opt.name.toLowerCase() === "size");
  const colorOption = product?.options.find((opt) => opt.name.toLowerCase() === "color");

  const availableSizes = sizeOption?.values.map((v) => v.value) || [];
  const availableColors = colorOption?.values.map((v) => v.value) || [];

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (!product || isError) {
    router.replace("/not-found");
    return null;
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

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Color</h3>
            <div className="flex gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={clsx(
                    "w-8 h-8 rounded-full border-2 transition-all duration-150",
                    selectedColor === color ? "border-gray-900 scale-110" : "border-none"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Size</h3>
            <div className="flex gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={clsx(
                    "w-10 h-10 rounded-md border text-sm font-medium flex items-center justify-center transition-all duration-150",
                    selectedSize === size ? "border-gray-900 bg-gray-100" : "border-gray-300"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
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
