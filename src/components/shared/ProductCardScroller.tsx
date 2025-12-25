"use client";

import React from "react";
import type { Category } from "@prisma/client";
import type { ProductExt } from "@/types/product";
import {
  Award,
  Clock,
  Gift,
  Package,
  ShoppingBag,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Zap,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { ProductCard } from "./ProductCard";
import Autoplay from "embla-carousel-autoplay";

interface ProductCardScrollerProps {
  products: (ProductExt & { category: Category })[];
  title?: string;
  linkProp?: string;
  loading?: boolean;
  showViewAll?: boolean;
  iconName?: string;
  enableAutoPlay?: boolean;
  autoPlayDelay?: number;
}

// Icon mapping object
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  trendingUp: TrendingUp,
  package: Package,
  shoppingBag: ShoppingBag,
  zap: Zap,
  award: Award,
  clock: Clock,
  gift: Gift,
  thumbsUp: ThumbsUp,
};

const ProductCardScroller = ({
  products,
  title,
  loading,
  iconName,
  enableAutoPlay = true,
  autoPlayDelay = 3000,
}: ProductCardScrollerProps) => {
  const plugins = React.useMemo(() => {
    if (!enableAutoPlay) return [];
    return [
      Autoplay({
        delay: autoPlayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ];
  }, [enableAutoPlay, autoPlayDelay]);

  if (loading) return <div>Loading...</div>;

  if (!products || products.length === 0) return null;

  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <div className="container mx-auto px-4 py-16">
      {title && (
        <div className="mb-12 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            {IconComponent && (
              <IconComponent className="size-8 text-primary" />
            )}
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
        </div>
      )}

      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={plugins}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
              >
                <ProductCard
                  product={product}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Mobile arrows - inside carousel */}
          <CarouselPrevious className="absolute left-2 top-1/2 size-12 -translate-y-1/2 border-none bg-black/10 text-white backdrop-blur-sm hover:bg-black/20 hover:text-white md:hidden [&>svg]:size-8" />
          <CarouselNext className="absolute right-2 top-1/2 size-12 -translate-y-1/2 border-none bg-black/10 text-white backdrop-blur-sm hover:bg-black/20 hover:text-white md:hidden [&>svg]:size-8" />
          {/* Desktop arrows - outside carousel */}
          <CarouselPrevious className="absolute -left-12 top-1/2 hidden -translate-y-1/2 md:flex" />
          <CarouselNext className="absolute -right-12 top-1/2 hidden -translate-y-1/2 md:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default ProductCardScroller;
