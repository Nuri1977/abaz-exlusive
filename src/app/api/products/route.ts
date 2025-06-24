import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type SortFields = "createdAt" | "price" | "name";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams?.get("page") || "1");
    const limit = parseInt(searchParams?.get("limit") || "12");
    const sortParam = searchParams?.get("sort") || "createdAt:desc";
    const category = searchParams?.get("category");
    const minPrice = searchParams?.get("minPrice");
    const maxPrice = searchParams?.get("maxPrice");
    const gender = searchParams?.get("gender");
    const brand = searchParams?.get("brand");
    const material = searchParams?.get("material");
    const style = searchParams?.get("style");
    const features = searchParams?.get("features");

    // Parse sort parameter with type safety
    const [field, order] = sortParam?.split(":");
    const sortField = (field || "createdAt") as SortFields;
    const sortOrder = (order || "desc") as "asc" | "desc";

    // Create properly typed orderBy object
    const orderBy: { [K in SortFields]?: "asc" | "desc" } = {
      [sortField]: sortOrder,
    };

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      // Get the selected category and its level
      const selectedCategory = await prisma.category.findUnique({
        where: { id: category },
        include: {
          children: true,
        },
      });

      if (selectedCategory) {
        let categoryIds = [selectedCategory?.id];

        // If it's a parent category (level 0 or 1), include all its children
        if (selectedCategory?.level < 2 && selectedCategory?.children) {
          categoryIds = [
            ...categoryIds,
            ...selectedCategory?.children?.map((child) => child?.id),
          ];

          // If it's a top-level category (level 0), also include grandchildren
          if (selectedCategory?.level === 0) {
            const childrenWithGrandchildren = await prisma.category.findMany({
              where: {
                parentId: {
                  in: selectedCategory?.children?.map((child) => child?.id),
                },
              },
            });
            categoryIds = [
              ...categoryIds,
              ...childrenWithGrandchildren?.map((child) => child?.id),
            ];
          }
        }

        where.categoryId = {
          in: categoryIds,
        };
      }
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    if (gender && gender !== "all") {
      where.gender = gender;
    }

    if (brand && brand !== "all") {
      where.brand = brand;
    }

    if (material && material !== "all") {
      where.material = material;
    }

    if (style && style !== "all") {
      where.style = style;
    }

    if (features) {
      const featureList = features?.split(",")?.filter(Boolean);
      if (featureList?.length > 0) {
        where.features = {
          hasSome: featureList,
        };
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: {
            include: {
              options: {
                include: {
                  optionValue: true,
                },
              },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const hasMore = page * limit < total;

    return NextResponse.json({
      products,
      pagination: {
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        total,
      },
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
