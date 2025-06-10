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
    <Link href={`/shop/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <h3 className="font-semibold">{product.name}</h3>
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
