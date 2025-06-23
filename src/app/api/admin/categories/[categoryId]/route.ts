import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { FileUploadThing } from "@/types/UploadThing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { utapi } from "@/utils/utapi";

interface CategoryIdParams {
  params: Promise<{ categoryId: string }>;
}

export async function PATCH(req: Request, { params }: CategoryIdParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = await params;
    const body = await req.json();
    const { name, description, image, parentId, isActive } = body;

    // Get current category to check for existing image
    const currentCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { parent: true },
    });

    if (!currentCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Calculate new level based on parent
    let level = 0;
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    // If there's an existing image and it's being updated, delete the old one
    if (currentCategory?.image && image) {
      const oldImage = currentCategory.image as FileUploadThing;
      await utapi.deleteFiles(oldImage.key);
    }

    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        slug: slugify(name),
        description,
        image: image ? image : Prisma.JsonNull,
        level,
        isActive,
        parent: parentId ? {
          connect: { id: parentId }
        } : {
          disconnect: true
        },
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: CategoryIdParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = await params;

    // Get category to check for image and children
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { children: true },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Delete image if exists
    if (category?.image) {
      const imageData = JSON.parse(category.image as string) as FileUploadThing;
      await utapi.deleteFiles(imageData.key);
    }

    // Update children to remove their parent reference
    if (category.children.length > 0) {
      await prisma.category.updateMany({
        where: { parentId: categoryId },
        data: { 
          parentId: null,
          level: 0,
        },
      });
    }

    // Delete category
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
