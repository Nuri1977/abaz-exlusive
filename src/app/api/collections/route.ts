import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get("includeProducts") === "true";

    const collections = await prisma.collection.findMany({
      where: {
        isActive: true,
      },
      include: includeProducts
        ? {
            products: {
              where: {
                category: {
                  isActive: true,
                },
              },
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
              },
              take: 10, // Limit products per collection for performance
            },
            _count: {
              select: {
                products: true,
              },
            },
          }
        : {
            _count: {
              select: {
                products: true,
              },
            },
          },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("[COLLECTIONS_PUBLIC_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}