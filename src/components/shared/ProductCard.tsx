"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useUserAccountContext } from "@/context/UserAccountContext";
import { Category } from "@prisma/client";
import { Heart, ShoppingCart } from "lucide-react";

import { ProductExt } from "@/types/product";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProductCardProps {
  product: ProductExt & {
    category: Category;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { toggleLike, isLiked } = useUserAccountContext();
  const { addItem, setOpen, currency, convertPrice, currencySymbol } =
    useCartContext();
  const liked = isLiked(product?.id);

  const hasVariants = product?.variants && product.variants.length > 0;

  const getImageUrl = (image: any) => {
    if (!image) return "/placeholder.png";
    if (typeof image === "string") return image;
    return image?.url || image?.appUrl || "/placeholder.png";
  };

  const handleAddToCart = () => {
    if (hasVariants) {
      // If product has variants, redirect to product page
      router.push(`/product/${product?.id}`);
      return;
    }

    // For products without variants, add directly to cart
    addItem({
      quantity: 1,
      price: Number(product?.price),
      productId: product?.id,
      title: product?.name,
      image: getImageUrl(product?.images?.[0]),
    });

    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
    });
    setOpen(true);
  };

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      {/* Main clickable area - entire card */}
      <Link
        href={`/product/${product?.id}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative aspect-square">
        <Image
          src={getImageUrl(product?.images?.[0])}
          alt={product?.name || ""}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product?.features?.length > 0 && (
          <div className="absolute right-2 top-2 flex gap-1">
            {product?.features?.slice(0, 2)?.map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
        {hasVariants && (
          <div className="absolute left-2 top-2">
            <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              {product?.variants?.length ?? 0} options
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{product?.brand}</p>
          <h3 className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
            {product?.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product?.category?.name}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex w-full items-center justify-between px-4 pb-4 pt-0">
        <p className="font-semibold">
          {currencySymbol}{" "}
          {convertPrice(Number(product?.price), "MKD", currency).toLocaleString(
            "de-DE",
            {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }
          )}
        </p>

        <div className="relative z-20 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            aria-label={hasVariants ? "View options" : "Add to cart"}
            className="text-black transition-colors hover:text-blue-600"
          >
            <ShoppingCart size={20} />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product?.images) {
                toggleLike({ ...product, images: product?.images ?? [] });
              }
            }}
            aria-label="Toggle like"
            className={cn(
              "transition-colors",
              liked ? "text-red-500" : "text-black hover:text-red-500"
            )}
          >
            <Heart size={20} className={liked ? "fill-current" : ""} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
