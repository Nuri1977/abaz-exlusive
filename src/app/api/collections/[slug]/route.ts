import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const collection = await prisma.collection.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        products: {
          where: {
            category: {
              isActive: true,
            },
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            variants: {
              select: {
                id: true,
                price: true,
                stock: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTION_BY_SLUG_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}