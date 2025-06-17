"use client";

import Image from "next/image";
import Link from "next/link";
import { Category, Product } from "@prisma/client";

import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
  product: Product & {
    category: Category;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.features && product.features.length > 0 && (
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
            <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="font-semibold">{formatPrice(Number(product.price))}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
