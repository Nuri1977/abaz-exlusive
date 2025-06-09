import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("Search params:", searchParams);
    console.log("Search params:", searchParams);
    console.log("Search params:", searchParams);
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

    console.log("Category filter:", category);

    const where: any = {};

    if (category) {
      const categoryIds = category.split(",").filter(Boolean);
      console.log("Category IDs:", categoryIds);
      if (categoryIds.length > 0) {
        where.categoryId = {
          in: categoryIds,
        };
      }
    }

    if (minPrice) {
      where.price = {
        ...where.price,
        gte: parseFloat(minPrice),
      };
    }

    if (maxPrice) {
      where.price = {
        ...where.price,
        lte: parseFloat(maxPrice),
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

    console.log("Where clause:", where);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    console.log("Found products:", products.length);

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
