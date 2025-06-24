"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAccountContext } from "@/context/UserAccountContext";
import { Category, Product } from "@prisma/client";
import { Heart } from "lucide-react";

import type { ProductExt } from "@/types/product";
import { authClient } from "@/lib/auth-client";
import { cn, formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
  product: ProductExt & {
    category?: Category | null;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { toggleLike, isLiked } = useUserAccountContext();
  const { data: session } = authClient.useSession();

  const liked = isLiked(product?.id);

  const getImageUrl = (image: any) => {
    if (!image) return "/placeholder.png";
    if (typeof image === "string") return image;
    return image?.url || image?.appUrl || "/placeholder.png";
  };

  const handleLikeClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Convert ProductExt to Product type for toggleLike
    const productForLike: Product = {
      ...product,
      // Convert FileUploadThing[] to JsonValue[]
      images:
        product?.images?.map((img) => ({
          url: getImageUrl(img),
          key: typeof img === "string" ? img : img?.key,
          size: typeof img === "string" ? 0 : img?.size,
        })) || [],
    };

    toggleLike(productForLike);
    toast({
      title: liked ? "Removed from likes" : "Added to likes",
      description: liked
        ? "Product has been removed from your likes"
        : "Product has been added to your likes",
    });
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-square">
        <Image
          src={getImageUrl(product?.images?.[0])}
          alt={product?.name || ""}
          fill
          className="object-cover"
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
      </div>
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{product?.brand}</p>
          <Link
            href={`/product/${product?.slug}`}
            className="line-clamp-2 font-semibold hover:underline"
          >
            {product?.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {product?.category?.name}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 p-4 pt-0">
        <p className="font-semibold">{formatPrice(Number(product?.price))}</p>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full p-2 transition-colors",
            liked && "text-red-500 hover:text-red-600"
          )}
          onClick={handleLikeClick}
        >
          <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          <span className="sr-only">
            {liked ? "Remove from likes" : "Add to likes"}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
