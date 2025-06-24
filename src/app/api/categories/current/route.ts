import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(null);
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true, // Support up to 4 levels of hierarchy
              },
            },
          },
        },
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CURRENT_CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}