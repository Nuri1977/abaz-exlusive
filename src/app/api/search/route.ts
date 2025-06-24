import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    if (!query) {
      return new NextResponse(
        JSON.stringify({ message: "Search query is required" }),
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Perform full-text search across multiple fields
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
          { style: { contains: query, mode: "insensitive" } },
          { material: { contains: query, mode: "insensitive" } },
          { features: { has: query } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        category: true,
        variants: {
          include: {
            inventory: true,
            options: {
              include: {
                optionValue: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get total count for pagination
    const total = await prisma.product.count({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
          { style: { contains: query, mode: "insensitive" } },
          { material: { contains: query, mode: "insensitive" } },
          { features: { has: query } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
    });

    return new NextResponse(
      JSON.stringify({
        products,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}