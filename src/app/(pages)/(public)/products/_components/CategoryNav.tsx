"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.get("category")?.split(",") || [];

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId === "all") {
      params.delete("category");
    } else {
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories, categoryId];

      if (newCategories.length) {
        params.set("category", newCategories.join(","));
      } else {
        params.delete("category");
      }
    }

    router.push(`/products?${params.toString()}`);
  };

  const CategorySkeleton = () => (
    <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-9 w-24 shrink-0 rounded-md border border-border bg-muted/50"
        />
      ))}
    </div>
  );

  const CategoryButtons = () => (
    <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
      <button
        onClick={() => handleCategoryClick("all")}
        className={cn(
          "shrink-0 px-4 py-2 text-sm font-medium transition-colors",
          selectedCategories.length === 0
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        All
      </button>
      {categories?.map((category: Category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={cn(
            "shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
            selectedCategories.includes(category.id)
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Desktop Layout */}
      <div className="hidden items-center gap-4 md:flex">
        {isLoading ? <CategorySkeleton /> : <CategoryButtons />}
      </div>

      {/* Mobile Layout */}
      <div className="space-y-4 md:hidden">
        {isLoading ? <CategorySkeleton /> : <CategoryButtons />}
      </div>
    </div>
  );
}
