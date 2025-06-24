"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

import {
  categoryKeys,
  fetchPublicCategories,
  type CategoryWithRelations,
} from "@/lib/query/categories";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams?.get("category");

  const { data: categories, isLoading } = useQuery({
    queryKey: categoryKeys.public(),
    queryFn: fetchPublicCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-32" />
      ))}
    </div>
  );

  if (isLoading) {
    return <CategorySkeleton />;
  }

  // Get top level (grandparent) categories
  const grandparentCategories =
    categories?.filter((cat) => cat?.level === 0) ?? [];

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              !selectedCategory && "bg-accent",
              "cursor-pointer"
            )}
            onClick={() => handleCategoryClick("all")}
          >
            All Products
          </NavigationMenuLink>
        </NavigationMenuItem>

        {grandparentCategories?.map((grandparent) => (
          <NavigationMenuItem key={grandparent?.id}>
            {grandparent?.children?.length > 0 ? (
              <>
                <NavigationMenuTrigger
                  className={cn(
                    selectedCategory === grandparent?.id && "bg-accent"
                  )}
                >
                  {grandparent?.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[500px] gap-3 p-4 md:w-[600px] lg:w-[700px]">
                    <nav className="grid gap-4">
                      {/* Grandparent category link */}
                      <NavigationMenuLink
                        className={cn(
                          "block w-full cursor-pointer select-none rounded-md bg-muted/50 p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          selectedCategory === grandparent?.id && "bg-accent"
                        )}
                        onClick={() => handleCategoryClick(grandparent?.id)}
                      >
                        <div className="flex items-center gap-3">
                          {grandparent?.image?.ufsUrl && (
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                              <Image
                                src={grandparent.image.ufsUrl}
                                alt={grandparent?.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-base font-medium">
                              {grandparent?.name}
                            </div>
                            {grandparent?.description && (
                              <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {grandparent?.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </NavigationMenuLink>

                      {/* Parent categories */}
                      <div className="grid grid-cols-2 gap-4">
                        {grandparent?.children?.map((parent) => (
                          <div key={parent?.id} className="space-y-2">
                            <NavigationMenuLink
                              className={cn(
                                "block cursor-pointer select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                selectedCategory === parent?.id && "bg-accent"
                              )}
                              onClick={() => handleCategoryClick(parent?.id)}
                            >
                              <div className="flex items-center gap-3">
                                {parent?.image?.ufsUrl && (
                                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
                                    <Image
                                      src={parent.image.ufsUrl}
                                      alt={parent.name}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium leading-none">
                                    {parent?.name}
                                  </div>
                                  {parent?.description && (
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {parent?.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </NavigationMenuLink>

                            {/* Child categories */}
                            {parent?.children?.length > 0 && (
                              <div className="ml-3 space-y-1 border-l pl-3">
                                {parent?.children?.map((child) => (
                                  <NavigationMenuLink
                                    key={child?.id}
                                    className={cn(
                                      "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                      selectedCategory === child?.id &&
                                        "bg-accent"
                                    )}
                                    onClick={() =>
                                      handleCategoryClick(child?.id)
                                    }
                                  >
                                    {child?.image?.ufsUrl ? (
                                      <div className="relative size-6 shrink-0 overflow-hidden rounded-md">
                                        <Image
                                          src={child.image.ufsUrl}
                                          alt={child.name}
                                          fill
                                          sizes="24px"
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <span>{child?.name}</span>
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </nav>
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  selectedCategory === grandparent?.id && "bg-accent",
                  "cursor-pointer"
                )}
                onClick={() => handleCategoryClick(grandparent?.id)}
              >
                {grandparent?.name}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
