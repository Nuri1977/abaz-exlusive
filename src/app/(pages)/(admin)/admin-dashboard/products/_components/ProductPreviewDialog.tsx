"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Eye, Pencil } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import type { ProductWithVariants } from "./ProductTable";

interface ProductPreviewDialogProps {
  product: ProductWithVariants;
  trigger?: React.ReactNode;
}

export function ProductPreviewDialog({
  product,
  trigger,
}: ProductPreviewDialogProps) {
  const [open, setOpen] = useState(false);

  const getCategoryPath = (category: ProductWithVariants["category"]) => {
    if (!category) return "Uncategorized";
    const names = [];
    if (category?.parent?.parent) names.push(category?.parent?.parent?.name);
    if (category?.parent) names.push(category?.parent?.name);
    names.push(category?.name);
    return names.join(" > ");
  };

  const getStockStatus = () => {
    const totalStock =
      product?.variants?.reduce(
        (sum, variant) => sum + (variant?.stock || 0),
        0
      ) || 0;
    if (totalStock === 0)
      return { status: "Out of Stock", color: "destructive" as const };
    if (totalStock < 10)
      return { status: "Low Stock", color: "secondary" as const };
    return { status: "In Stock", color: "default" as const };
  };

  const stockInfo = getStockStatus();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Preview Product">
            <Eye className="size-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Product Preview
            <Badge variant={stockInfo.color}>{stockInfo.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Preview product details and information
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Product Images */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                {product?.images &&
                product?.images?.length > 0 &&
                product?.images?.[0]?.url ? (
                  <div className="grid gap-2">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={product.images[0].url}
                        alt={product?.name || "Product image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    {product?.images?.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images
                          .slice(1, 5)
                          .filter((image: any) => image?.url)
                          .map((image: any, index: number) => (
                            <div
                              key={index}
                              className="relative aspect-square overflow-hidden rounded-md bg-muted"
                            >
                              <Image
                                src={image.url}
                                alt={`${product?.name || "Product"} image ${index + 2}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                    <span className="text-muted-foreground">No images</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{product?.name}</h3>
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(product?.price ? Number(product?.price) : 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm text-muted-foreground">
                      {getCategoryPath(product?.category)}
                    </span>
                  </div>

                  {product?.brand && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Brand:</span>
                      <span className="text-sm text-muted-foreground">
                        {product?.brand}
                      </span>
                    </div>
                  )}

                  {product?.gender && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Gender:</span>
                      <span className="text-sm text-muted-foreground">
                        {product?.gender}
                      </span>
                    </div>
                  )}

                  {product?.style && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Style:</span>
                      <span className="text-sm text-muted-foreground">
                        {product?.style}
                      </span>
                    </div>
                  )}

                  {product?.material && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Material:</span>
                      <span className="text-sm text-muted-foreground">
                        {product?.material}
                      </span>
                    </div>
                  )}
                </div>

                {product?.description && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Description</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product?.description}
                    </p>
                  </div>
                )}

                {product?.features && product?.features?.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {product?.features?.map(
                        (feature: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Variants */}
            {product?.variants && product?.variants?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-4 text-lg font-semibold">
                    Product Variants
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {product?.variants?.map((variant: any) => (
                      <div key={variant?.id} className="rounded-lg border p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{variant?.sku}</span>
                            <Badge
                              variant={
                                variant?.stock > 0 ? "default" : "destructive"
                              }
                            >
                              {variant?.stock} in stock
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {variant?.options?.map((opt: any) => (
                              <span key={opt?.optionValue?.id} className="mr-2">
                                {opt?.optionValue?.value}
                              </span>
                            ))}
                          </div>

                          <div className="font-medium">
                            {formatPrice(
                              variant?.price
                                ? Number(variant?.price)
                                : Number(product?.price)
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button asChild>
            <Link href={`/admin-dashboard/products/${product?.id}`}>
              <Pencil className="mr-2 size-4" />
              Edit Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/products/${product?.slug}`} target="_blank">
              <ExternalLink className="mr-2 size-4" />
              View on Site
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
