"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  Clock,
  Gift,
  Heart,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: any[];
  category?: {
    id: string;
    name: string;
    image: any;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    parentId: string | null;
    isActive: boolean;
    level: number;
  };
  brand?: string;
  description?: string;
  variants?: any[];
  features?: string[];
}

interface ProductCardScrollerProps {
  products: Product[];
  title?: string;
  linkProp?: string;
  loading?: boolean;
  showViewAll?: boolean;
  iconName?: string;
}

// Icon mapping object
const iconMap: { [key: string]: React.ComponentType<any> } = {
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
  linkProp,
  loading,
  showViewAll = false,
  iconName,
}: ProductCardScrollerProps) => {
  if (loading) return <div>Loading...</div>;

  if (!products || products.length === 0) return null;

  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <div className="container mx-auto px-4 py-16">
      {title && (
        <div className="mb-12 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            {IconComponent && (
              <IconComponent className="h-8 w-8 text-primary" />
            )}
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
        </div>
      )}

      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
              >
                <ProductCard
                  product={
                    {
                      ...product,
                      category: product.category || {
                        id: "",
                        name: "",
                        image: null,
                        slug: "",
                        description: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        parentId: null,
                        isActive: true,
                        level: 0,
                      },
                      variants: product.variants || [],
                      features: product.features || [],
                    } as any
                  }
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Mobile arrows - inside carousel */}
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 md:hidden" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden" />
          {/* Desktop arrows - outside carousel */}
          <CarouselPrevious className="absolute -left-12 top-1/2 hidden -translate-y-1/2 md:flex" />
          <CarouselNext className="absolute -right-12 top-1/2 hidden -translate-y-1/2 md:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default ProductCardScroller;
