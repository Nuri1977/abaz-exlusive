"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";

export function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.get("category")?.split(",") || [];

  const { data: categories } = useQuery({
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

  return (
    <div className="space-y-4">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleCategoryClick("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors shrink-0",
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
                "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                selectedCategories.includes(category.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleCategoryClick("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors shrink-0",
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
                "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                selectedCategories.includes(category.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
