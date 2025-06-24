import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortParam = searchParams.get("sort") || "createdAt:desc";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const gender = searchParams.get("gender");
    const brand = searchParams.get("brand");
    const material = searchParams.get("material");
    const style = searchParams.get("style");
    const features = searchParams.get("features");

    // Parse sort parameter
    const [sortField, sortOrder] = sortParam.split(":");
    const orderBy = {
      [sortField]: sortOrder,
    };

    const where: Prisma.ProductWhereInput = {};

    // TODO: Refactor filtering logic
    // Consider:
    // 1. Creating a separate function to handle filter transformations
    // 2. Using a more declarative approach with filter mapping
    // 3. Potentially using a filter builder pattern
    // 4. Adding validation for filter values
    if (category) {
      const categoryIds = category.split(",").filter(Boolean);
      if (categoryIds.length > 0) {
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
      const featureList = features.split(",").filter(Boolean);
      if (featureList.length > 0) {
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
