import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return new NextResponse("Product slug is required", { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        collection: true,
        options: {
          include: { values: true },
        },
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
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
