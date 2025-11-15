"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useUserAccountContext } from "@/context/UserAccountContext";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Heart } from "lucide-react";

import type { ProductWithOptionsAndVariants } from "@/types/product";
import { queryKeys } from "@/config/tanstackConfig";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

import ProductImageGallery from "./ProductImageGallery";
import ProductPageSkeleton from "./ProductPageSkeleton";

export default function ProductPageClient({ slug }: { slug: string }) {
  const { addItem, setOpen, currency, convertPrice, currencySymbol } =
    useCartContext();
  const { toggleLike, isLiked } = useUserAccountContext();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [queryKeys.products, slug],
    queryFn: async () => {
      const res = await api.get<ProductWithOptionsAndVariants>(
        `/product/${slug}`
      );
      if (res.status === 404) notFound();
      return res.data ?? null;
    },
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) return <ProductPageSkeleton />;
  if (isError || !product) notFound();

  const liked = isLiked(product.id);
  const hasVariants = product.variants && product.variants.length > 0;

  const availableSizes = hasVariants
    ? Array.from(
      new Set(
        product.variants.flatMap((variant) =>
          variant.options
            .filter((opt) =>
              opt.optionValue?.value?.match(/^\d*[XSML]{1,2}$/i)
            )
            .map((opt) => opt.optionValue.value)
        )
      )
    )
    : [];

  const availableColors = hasVariants
    ? Array.from(
      new Set(
        product.variants.flatMap((variant) =>
          variant.options
            .filter(
              (opt) => !opt.optionValue?.value?.match(/^\d*[XSML]{1,2}$/i)
            )
            .map((opt) => opt.optionValue.value)
        )
      )
    )
    : [];

  const matchedVariant = hasVariants
    ? product.variants.find((variant) => {
      const optionValues = variant.options.map(
        (opt) => opt.optionValue.value
      );
      return (
        optionValues.includes(selectedColor || "") &&
        optionValues.includes(selectedSize || "")
      );
    })
    : null;

  const effectivePrice = matchedVariant?.price ?? product.price ?? 0;

  // const effectiveStock = matchedVariant?.stock ?? (hasVariants ? 0 : 1);

  const handleAddToCart = () => {
    // For products with variants, require a selected variant
    if (hasVariants && !matchedVariant) return;

    addItem({
      variantId: matchedVariant?.id,
      quantity,
      price: +effectivePrice,
      productId: product.id,
      title: product.name,
      image: product.images?.[0]?.url ?? "/placeholder.jpg",
      color: selectedColor ?? undefined,
      size: selectedSize ?? undefined,
    });
    setOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="md:sticky md:top-4">
          <ProductImageGallery images={product.images ?? []} />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>

          <div className="flex items-center space-x-2">
            <span className="text-3xl font-semibold">
              {currencySymbol}{" "}
              {convertPrice(Number(effectivePrice), "MKD", currency).toFixed(2)}
            </span>
          </div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          {hasVariants && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Color</h3>
                <div className="flex gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={clsx(
                        "size-8 rounded-full border-2 transition-all duration-150",
                        selectedColor === color
                          ? "scale-110 border-gray-900"
                          : "border-none"
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
                        "flex size-10 items-center justify-center rounded-md border text-sm font-medium transition-all duration-150",
                        selectedSize === size
                          ? "border-gray-900 bg-gray-100"
                          : "border-gray-300"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Quantity</h3>
            <input
              type="number"
              value={quantity}
              min={1}
              // max={effectiveStock}
              max={99}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 rounded border px-2 py-1"
              disabled={hasVariants && !matchedVariant}
            />
          </div>

          <div className="flex gap-8 pt-4">
            <Button
              disabled={
                quantity < 1 || (hasVariants && !matchedVariant)
                // || quantity > effectiveStock --> to add this when stock is implemented
              }
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <button
              onClick={() =>
                toggleLike({ ...product, images: product.images ?? [] })
              }
              className={`transition-colors ${liked ? "text-red-500" : "text-black hover:text-red-500"}`}
            >
              <Heart size={30} className={liked ? "fill-current" : ""} />
            </button>
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