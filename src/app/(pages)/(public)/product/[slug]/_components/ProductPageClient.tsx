"use client";

import { useState, useMemo, useEffect } from "react";
import { notFound } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useUserAccountContext } from "@/context/UserAccountContext";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Heart } from "lucide-react";
import type { Product } from "@prisma/client";

import type { ProductWithOptionsAndVariants } from "@/types/product";
import { queryKeys } from "@/config/tanstackConfig";
import api from "@/lib/axios";
import { ApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import ContactMethods from "@/components/shared/ContactMethods";

import ProductImageGallery from "./ProductImageGallery";
import ProductPageSkeleton from "./ProductPageSkeleton";

export default function ProductPageClient({ slug }: { slug: string }) {
  const { addItem, setOpen, currency, convertPrice, currencySymbol } =
    useCartContext();
  const { toggleLike, isLiked } = useUserAccountContext();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<ProductWithOptionsAndVariants | null>({
    queryKey: [queryKeys.products, slug],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: ProductWithOptionsAndVariants }>(
          `/product/${slug}`
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled: !!slug,
    retry: false,
  });

  // Pre-select first options if available (optional UX improvement)
  useEffect(() => {
    if (product?.options && Object.keys(selectedOptions).length === 0) {
      // Logic for defaults kept empty as per design choice
    }
  }, [product, selectedOptions]);

  // Derived state
  const hasVariants = !!(product?.variants && product.variants.length > 0);
  const liked = product ? isLiked(product.id) : false;

  const matchedVariant = useMemo(() => {
    if (!product || !hasVariants) return null;
    
    // Check if checks are complete
    const isSelectionComplete = product.options?.every(opt => selectedOptions[opt.id]);
    if (!isSelectionComplete) return null;

    return product.variants.find((variant) => {
      return variant.options.every((variantOpt) => {
        const optionId = variantOpt.optionValue.optionId;
        const selectedValueId = selectedOptions[optionId];
        return selectedValueId === variantOpt.optionValue.id;
      });
    });
  }, [product, hasVariants, selectedOptions]);

  const effectivePrice = matchedVariant?.price ?? product?.price ?? 0;
  const effectiveStock = matchedVariant?.stock ?? (hasVariants ? 0 : 99);

  // Early returns MUST be after all hooks
  if (isLoading) return <ProductPageSkeleton />;
  if (isError || !product) notFound();

  const displayImages = matchedVariant?.images?.length
  ? matchedVariant.images
  : product?.images ?? [];

  const handleAddToCart = () => {
    if (hasVariants && !matchedVariant) return;

    // Extract all selected options dynamically
    const variantOptions: { name: string; value: string }[] = [];

    product.options?.forEach(opt => {
      const val = opt.values.find(v => v.id === selectedOptions[opt.id]);
      if (val) {
        variantOptions.push({ name: opt.name, value: val.value });
      }
    });

    addItem({
      variantId: matchedVariant?.id,
      quantity,
      price: +effectivePrice,
      productId: product.id,
      title: product.name,
      image: matchedVariant?.images?.[0]?.url ?? product.images?.[0]?.url ?? "/placeholder.jpg",
      variantOptions,
    });
    setOpen(true);
  };

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="md:sticky md:top-4">
          <ProductImageGallery images={displayImages} />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>

          <div className="flex items-center space-x-2">
            <span className="text-3xl font-semibold">
              {currencySymbol}{" "}
              {convertPrice(Number(effectivePrice), "MKD", currency).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }
              )}
            </span>
          </div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          {/* Dynamic Options Rendering */}
          {hasVariants && product.options?.map((option) => (
            <div key={option.id} className="space-y-2">
              <h3 className="text-sm font-medium">{option.name}</h3>
              <div className="flex flex-wrap gap-2">
                {option.values.map((val) => {
                  const isSelected = selectedOptions[option.id] === val.id;
                  const isColor = option.name.toLowerCase() === "color";
                  
                  if (isColor) {
                    return (
                      <button
                        key={val.id}
                        onClick={() => handleOptionSelect(option.id, val.id)}
                        className={clsx(
                          "size-8 rounded-full border-2 transition-all duration-150",
                          isSelected
                            ? "scale-110 border-gray-900"
                            : "border-transparent ring-1 ring-gray-200"
                        )}
                        style={{ backgroundColor: val.value }}
                        title={val.value}
                        aria-label={`Select ${val.value}`}
                      />
                    );
                  }

                  return (
                    <button
                      key={val.id}
                      onClick={() => handleOptionSelect(option.id, val.id)}
                      className={clsx(
                        "flex min-w-[3rem] items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150",
                        isSelected
                          ? "border-gray-900 bg-gray-100"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {val.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Quantity</h3>
            <input
              type="number"
              value={quantity}
              min={1}
              max={effectiveStock > 0 ? effectiveStock : 99}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 rounded border px-2 py-1"
              disabled={hasVariants && !matchedVariant}
            />
          </div>

          <div className="flex gap-8 pt-4">
            <Button
              disabled={
                quantity < 1 || (hasVariants && !matchedVariant) || (hasVariants ? effectiveStock === 0 : false)
              }
              onClick={handleAddToCart}
            >
              {hasVariants && !matchedVariant 
                ? "Select Options" 
                : effectiveStock === 0 
                  ? "Out of Stock" 
                  : "Add to Cart"}
            </Button>
            <button
              onClick={() =>
                toggleLike({
                  ...product,
                  images: product.images ?? [],
                } as unknown as Product)
              }
              className={`transition-colors ${liked ? "text-red-500" : "text-black hover:text-red-500"}`}
            >
              <Heart size={30} className={liked ? "fill-current" : ""} />
            </button>
          </div>

          <div className="pt-4">
            <h3 className="mb-3 text-sm font-medium">Have a question? Chat with us:</h3>
            <ContactMethods 
              productName={product.name} 
              price={`${currencySymbol}${convertPrice(Number(effectivePrice), "MKD", currency).toLocaleString("de-DE")}`}
              showViber={true}
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.brand && (
                <div>
                  <h3 className="font-medium">Brand</h3>
                  <p className="capitalize text-gray-600">{product.brand}</p>
                </div>
              )}
              {product.gender && (
                <div>
                  <h3 className="font-medium">Gender</h3>
                  <p className="capitalize text-gray-600">{product.gender}</p>
                </div>
              )}
              {product.style && (
                <div>
                  <h3 className="font-medium">Style</h3>
                  <p className="capitalize text-gray-600">{product.style}</p>
                </div>
              )}
              {product.material && (
                  <div>
                    <h3 className="font-medium">Material</h3>
                    <p className="capitalize text-gray-600">{product.material}</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}