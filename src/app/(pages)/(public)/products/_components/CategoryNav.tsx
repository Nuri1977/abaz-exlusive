"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryWithRelations = Category & {
  parent: CategoryWithRelations | null;
  children: CategoryWithRelations[];
};

export function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams?.get("category");

  const { data: categories, isLoading } = useQuery<CategoryWithRelations[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response?.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response?.json();
    },
  });

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (categoryId === "all") {
      params?.delete("category");
    } else {
      params?.set("category", categoryId);
    }
    router?.push(`/products?${params?.toString()}`);
  };

  const CategorySkeleton = () => (
    <div className="space-y-4">
      <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 w-24 shrink-0 rounded-md border border-border bg-muted/50"
          />
        ))}
      </div>
      <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 w-24 shrink-0 rounded-md border border-border bg-muted/50"
          />
        ))}
      </div>
      <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 w-24 shrink-0 rounded-md border border-border bg-muted/50"
          />
        ))}
      </div>
    </div>
  );

  const CategoryButtons = () => {
    if (!categories) return null;

    // Find the currently selected category and its ancestors
    const selectedCategoryData = selectedCategory
      ? findCategoryAndAncestors(categories, selectedCategory)
      : null;

    // Get categories for each level with null checks
    const topLevelCategories =
      categories?.filter((cat) => cat?.level === 0) ?? [];
    const secondLevelCategories = selectedCategoryData?.level0
      ? (categories?.filter(
          (cat) => cat?.parentId === selectedCategoryData?.level0?.id
        ) ?? [])
      : [];
    const thirdLevelCategories = selectedCategoryData?.level1
      ? (categories?.filter(
          (cat) => cat?.parentId === selectedCategoryData?.level1?.id
        ) ?? [])
      : [];

    return (
      <div className="space-y-4">
        {/* Top Level Categories */}
        <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategoryClick("all")}
            className={cn(
              "shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {topLevelCategories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => handleCategoryClick(category?.id)}
              className={cn(
                "shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
                selectedCategoryData?.level0?.id === category?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category?.name}
            </button>
          ))}
        </div>

        {/* Second Level Categories */}
        {secondLevelCategories?.length > 0 && (
          <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
            {secondLevelCategories?.map((category) => (
              <button
                key={category?.id}
                onClick={() => handleCategoryClick(category?.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
                  selectedCategoryData?.level1?.id === category?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {category?.name}
              </button>
            ))}
          </div>
        )}

        {/* Third Level Categories */}
        {thirdLevelCategories?.length > 0 && (
          <div className="scrollbar-hide flex items-center space-x-1 overflow-x-auto pb-2">
            {thirdLevelCategories?.map((category) => (
              <button
                key={category?.id}
                onClick={() => handleCategoryClick(category?.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
                  selectedCategoryData?.level2?.id === category?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {category?.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isLoading ? <CategorySkeleton /> : <CategoryButtons />}
    </div>
  );
}

// Helper function to find a category and its ancestors
function findCategoryAndAncestors(
  categories: CategoryWithRelations[],
  categoryId: string
) {
  const findCategory = (id: string): CategoryWithRelations | null => {
    for (const category of categories) {
      if (category?.id === id) return category;
      if (category?.children) {
        const found = category.children?.find((child) => child?.id === id);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findCategory(categoryId);
  if (!category) return null;

  const result: {
    level0?: CategoryWithRelations;
    level1?: CategoryWithRelations;
    level2?: CategoryWithRelations;
  } = {};

  if (category?.level === 2) {
    result.level2 = category;
    const parent = category?.parentId ? findCategory(category.parentId) : null;
    if (parent) {
      result.level1 = parent;
      const grandparent = parent?.parentId
        ? findCategory(parent.parentId)
        : null;
      if (grandparent) {
        result.level0 = grandparent;
      }
    }
  } else if (category?.level === 1) {
    result.level1 = category;
    const parent = category?.parentId ? findCategory(category.parentId) : null;
    if (parent) {
      result.level0 = parent;
    }
  } else {
    result.level0 = category;
  }

  return result;
}
