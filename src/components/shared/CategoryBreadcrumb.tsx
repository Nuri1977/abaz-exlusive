"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { useCurrentCategory } from "@/hooks/useCurrentCategory";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function CategoryBreadcrumb() {
  const { category, isLoading } = useCurrentCategory();

  if (isLoading || !category) {
    return null;
  }

  // Build breadcrumb items from the category hierarchy
  const breadcrumbItems = [];
  let currentCategory = category;

  while (currentCategory) {
    breadcrumbItems.unshift(currentCategory);
    currentCategory = currentCategory?.parent;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home className="size-3" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="size-3" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/products">Products</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems?.map((item, index) => (
          <React.Fragment key={item?.id}>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {index === breadcrumbItems?.length - 1 ? (
                <BreadcrumbPage>{item?.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={`/products?category=${item?.id}`}>
                    {item?.name}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
