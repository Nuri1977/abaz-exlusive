"use client";

import { Package, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  Product?: {
    id: string;
    name: string;
    slug: string;
    images: any[];
  };
  variant?: {
    id: string;
    sku: string;
    options: {
      optionValue: {
        value: string;
        option: {
          name: string;
        };
      };
    }[];
  };
}

interface OrderItemsPreviewCellProps {
  items: OrderItem[];
  orderId: string;
  currency?: string;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  size?: "sm" | "md" | "lg";
  maxItems?: number;
  showQuantity?: boolean;
  showPrice?: boolean;
  showVariants?: boolean;
}

const sizeConfig = {
  sm: {
    image: "size-6",
    text: "text-xs",
    badge: "text-xs px-1 py-0.5",
    gap: "gap-1",
  },
  md: {
    image: "size-8",
    text: "text-sm",
    badge: "text-xs px-1.5 py-0.5",
    gap: "gap-2",
  },
  lg: {
    image: "size-10",
    text: "text-sm",
    badge: "text-xs px-2 py-1",
    gap: "gap-2",
  },
};

export function OrderItemsPreviewCell({
  items,
  orderId,
  currency = "USD",
  className,
  variant = "default",
  size = "md",
  maxItems = 3,
  showQuantity = true,
  showPrice = false,
  showVariants = false,
}: OrderItemsPreviewCellProps) {
  const sizeStyles = sizeConfig[size];
  const visibleItems = items.slice(0, maxItems);
  const remainingCount = Math.max(0, items.length - maxItems);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getVariantText = (item: OrderItem) => {
    if (!item.variant?.options?.length) return null;
    return item.variant.options
      .map((opt) => opt.optionValue.value)
      .join(", ");
  };

  // Compact variant for mobile/small spaces
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center", sizeStyles.gap, className)}>
        <div className="flex -space-x-1">
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "relative overflow-hidden rounded border-2 border-background",
                sizeStyles.image
              )}
              style={{ zIndex: visibleItems.length - index }}
            >
              {item.Product?.images?.[0] &&
                typeof item.Product.images[0] === "string" ? (
                <Image
                  src={item.Product.images[0]}
                  alt={item.Product?.name || "Product"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted">
                  <Package className="size-3 text-muted-foreground" />
                </div>
              )}
              {showQuantity && item.quantity > 1 && (
                <Badge
                  className={cn(
                    "absolute -right-1 -top-1 size-4 rounded-full p-0 text-xs",
                    sizeStyles.badge
                  )}
                >
                  {item.quantity}
                </Badge>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div
              className={cn(
                "flex items-center justify-center rounded border-2 border-background bg-muted",
                sizeStyles.image
              )}
            >
              <Plus className="size-3 text-muted-foreground" />
              <span className="text-xs font-medium">{remainingCount}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn(sizeStyles.text, "font-medium truncate")}>
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant with full item information
  if (variant === "detailed") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {items.length} Product{items.length !== 1 ? "s" : ""} ({totalItems}{" "}
            item{totalItems !== 1 ? "s" : ""})
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin-dashboard/orders/${orderId}`}>
              View Order
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          {visibleItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={cn("relative overflow-hidden rounded", sizeStyles.image)}>
                {item.Product?.images?.[0] &&
                  typeof item.Product.images[0] === "string" ? (
                  <Image
                    src={item.Product.images[0]}
                    alt={item.Product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/product/${item.Product?.slug}`}
                    className={cn(
                      sizeStyles.text,
                      "font-medium truncate hover:underline"
                    )}
                  >
                    {item.Product?.name || "Unknown Product"}
                  </Link>
                  {showPrice && (
                    <span className={cn(sizeStyles.text, "font-medium")}>
                      {formatCurrency(item.price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {showQuantity && (
                    <Badge variant="secondary" className={sizeStyles.badge}>
                      Qty: {item.quantity}
                    </Badge>
                  )}
                  {showVariants && getVariantText(item) && (
                    <Badge variant="outline" className={sizeStyles.badge}>
                      {getVariantText(item)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin-dashboard/orders/${orderId}`}>
                  +{remainingCount} more item{remainingCount !== 1 ? "s" : ""}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", sizeStyles.gap, className)}>
            <div className="flex -space-x-2">
              {visibleItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative overflow-hidden rounded border-2 border-background",
                    sizeStyles.image
                  )}
                  style={{ zIndex: visibleItems.length - index }}
                >
                  {item.Product?.images?.[0] &&
                    typeof item.Product.images[0] === "string" ? (
                    <Image
                      src={item.Product.images[0]}
                      alt={item.Product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-muted">
                      <Package className="size-3 text-muted-foreground" />
                    </div>
                  )}
                  {showQuantity && item.quantity > 1 && (
                    <Badge
                      className={cn(
                        "absolute -right-1 -top-1 size-4 rounded-full p-0 text-xs",
                        sizeStyles.badge
                      )}
                    >
                      {item.quantity}
                    </Badge>
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className={cn(
                    "flex items-center justify-center rounded border-2 border-background bg-muted text-xs font-medium",
                    sizeStyles.image
                  )}
                >
                  +{remainingCount}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className={cn(sizeStyles.text, "font-medium truncate")}>
                {visibleItems[0]?.Product?.name || "Unknown Product"}
              </div>
              {items.length > 1 && (
                <div className={cn(sizeStyles.text, "text-muted-foreground")}>
                  +{items.length - 1} more item{items.length - 1 !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">
              Order Items ({totalItems} total)
            </div>
            {items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="truncate">
                  {item.Product?.name || "Unknown Product"}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ×{item.quantity}
                </span>
              </div>
            ))}
            {items.length > 5 && (
              <div className="text-xs text-muted-foreground">
                +{items.length - 5} more items
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to calculate total items
export function getTotalItemCount(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Helper function to get item preview text
export function getItemPreviewText(items: OrderItem[]): string {
  if (items.length === 0) return "No items";
  if (items.length === 1) return items[0].Product?.name || "Unknown Product";
  return `${items[0].Product?.name || "Unknown Product"} +${items.length - 1} more`;
}