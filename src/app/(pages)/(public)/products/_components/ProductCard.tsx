"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserAccountContext } from "@/context/UserAccountContext";
import { Category, Product } from "@prisma/client";
import { Heart } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductExt } from "@/types/product";

interface ProductCardProps {
  product: ProductExt & {
    category: Category;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleLike, isLiked } = useUserAccountContext();

  const liked = isLiked(product.id);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square">
        <Image
          src={product?.images?.[0]?.url || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.features?.length > 0 && (
          <div className="absolute right-2 top-2 flex gap-1">
            {product.features.slice(0, 2).map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <Link
            href={`/product/${product.id}`}
            className="line-clamp-2 font-semibold hover:underline"
          >
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {product.category.name}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 p-4 pt-0">
        <p className="font-semibold">{formatPrice(Number(product.price))}</p>
        <button
          onClick={() => {
            if (product?.images) {
              toggleLike({ ...product, images: product?.images ?? [] });
            }
          }}
          className={`transition-colors ${liked ? "text-red-500" : "text-black hover:text-red-500"}`}
        >
          <Heart className={liked ? "fill-current" : ""} />
        </button>
      </CardFooter>
    </Card>
  );
}
