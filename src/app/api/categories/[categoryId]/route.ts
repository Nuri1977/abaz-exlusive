import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

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
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}