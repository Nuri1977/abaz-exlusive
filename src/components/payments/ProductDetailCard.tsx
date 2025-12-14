"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductDetailCardProps {
  item: {
    id: string;
    quantity: number;
    price: number;
    Product?: {
      id: string;
      name: string;
      slug: string;
      description?: string;
      brand?: string;
      images: unknown[];
      category?: {
        id: string;
        name: string;
        parent?: {
          id: string;
          name: string;
          parent?: {
            id: string;
            name: string;
          };
        };
      };
      collection?: {
        id: string;
        name: string;
        slug: string;
      };
    };
    variant?: {
      id: string;
      sku: string;
      price?: number;
      options: {
        optionValue: {
          id: string;
          value: string;
          option: {
            name: string;
          };
        };
      }[];
    };
  };
  currency: string;
  showAdminInfo?: boolean;
}

export function ProductDetailCard({
  item,
  currency,
  showAdminInfo = false,
}: ProductDetailCardProps) {
  const product = item.Product;
  const variant = item.variant;

  if (!product) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
            <Package className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Product Unavailable</p>
            <p className="text-sm text-muted-foreground">
              Quantity: {item.quantity} × {Number(item.price).toFixed(2)}{" "}
              {currency}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get product image
  const images = Array.isArray(product.images) ? product.images : [];
  const firstImage = images[0] as { url?: string } | undefined;
  const imageUrl = firstImage?.url || "/placeholder-product.png";

  // Build category path
  const categoryPath: string[] = [];
  if (product.category) {
    if (product.category.parent?.parent?.name) {
      categoryPath.push(product.category.parent.parent.name);
    }
    if (product.category.parent?.name) {
      categoryPath.push(product.category.parent.name);
    }
    categoryPath.push(product.category.name);
  }

  // Get variant options
  const variantOptions =
    variant?.options?.map((opt) => ({
      name: opt.optionValue?.option?.name || "",
      value: opt.optionValue?.value || "",
    })) || [];

  const unitPrice = Number(variant?.price || item.price);
  const totalPrice = unitPrice * item.quantity;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link
            href={`/product/${product.slug}`}
            className="relative size-20 shrink-0 overflow-hidden rounded-lg sm:size-24"
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </Link>

          {/* Product Details */}
          <div className="flex-1 space-y-2">
            <div>
              <Link
                href={`/product/${product.slug}`}
                className="font-medium hover:underline"
              >
                {product.name}
              </Link>
              {product.brand && (
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              )}
            </div>

            {/* Category Path */}
            {categoryPath.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {categoryPath.join(" > ")}
              </p>
            )}

            {/* Collection */}
            {product.collection && (
              <Badge variant="secondary" className="text-xs">
                {product.collection.name}
              </Badge>
            )}

            {/* Variant Options */}
            {variantOptions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {variantOptions.map((opt, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {opt.name}: {opt.value}
                  </Badge>
                ))}
              </div>
            )}

            {/* SKU (Admin Only) */}
            {showAdminInfo && variant?.sku && (
              <p className="text-xs text-muted-foreground">
                SKU: {variant.sku}
              </p>
            )}

            {/* Pricing */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Quantity: {item.quantity} × {unitPrice.toFixed(2)} {currency}
              </div>
              <div className="text-lg font-semibold">
                {totalPrice.toFixed(2)} {currency}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
