"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "@/context/CartContext";
import { useUserAccountContext } from "@/context/UserAccountContext";
import { Category } from "@prisma/client";
import { Heart, ShoppingCart } from "lucide-react";

import { ProductExt } from "@/types/product";
import { cn, formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProductCardProps {
  product: ProductExt & {
    category: Category;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleLike, isLiked } = useUserAccountContext();
  const { addItem, setOpen } = useCartContext();
  const liked = isLiked(product.id);

  const handleAddToCart = () => {
    addItem({
      variantId: product.id, // using product ID as pseudo-variantId since variants aren't used here
      quantity: 1,
      price: Number(product.price),
      productId: product.id,
      title: product.name,
      image: product.images?.[0]?.url ?? "",
    });
    setOpen(true);
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square">
        <Image
          src={product?.images?.[0]?.url || ""}
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

      <CardFooter className="flex w-full items-center justify-between px-4 pb-4 pt-0">
        <p className="font-semibold">{formatPrice(Number(product.price))}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="text-black transition-colors hover:text-blue-600"
          >
            <ShoppingCart size={20} />
          </button>

          <Separator orientation="vertical" className="h-6" />

          <button
            onClick={() => {
              if (product?.images) {
                toggleLike({ ...product, images: product.images ?? [] });
              }
            }}
            aria-label="Toggle like"
            className={cn(
              "transition-colors",
              liked ? "text-red-500" : "text-black hover:text-red-500"
            )}
          >
            <Heart size={20} className={liked ? "fill-current" : ""} />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
