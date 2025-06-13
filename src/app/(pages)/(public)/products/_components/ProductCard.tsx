"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Product, Category } from "@prisma/client";

interface ProductCardProps {
  product: Product & {
    category: Category;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.features && product.features.length > 0 && (
            <div className="absolute top-2 right-2 flex gap-1">
              {product.features.slice(0, 2).map((feature) => (
                <span
                  key={feature}
                  className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full"
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
            <h3 className="font-semibold line-clamp-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="font-semibold">{formatPrice(Number(product.price))}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
