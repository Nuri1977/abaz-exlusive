import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { FileUploadThing } from "@/types/UploadThing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { utapi } from "@/utils/utapi";

interface CategoryIdParams {
  params: {
    categoryId: string;
  };
}

export async function PATCH(req: Request, { params }: CategoryIdParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, image, parentId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Get current category to check for existing image and current parent
    const currentCategory = await prisma.category.findUnique({
      where: { id: params.categoryId },
      include: {
        children: true,
      },
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
        // Prevent circular references
        if (parent.id === currentCategory.id) {
          return new NextResponse("Cannot set category as its own parent", { status: 400 });
        }
        // Check if the new parent is a child of the current category
        const isChild = await prisma.category.findFirst({
          where: {
            id: parent.id,
            OR: [
              { parentId: currentCategory.id },
              { parent: { parentId: currentCategory.id } },
            ],
          },
        });
        if (isChild) {
          return new NextResponse("Cannot set a child category as parent", { status: 400 });
        }
        level = parent.level + 1;
      }
    }

    // If there's an existing image and it's being updated, delete the old one
    if (currentCategory?.image && image && typeof image !== 'string') {
      const oldImage = currentCategory.image as FileUploadThing;
      await utapi.deleteFiles(oldImage.key);
    }

    // Update the category and its children's levels if parent changed
    const levelDiff = level - currentCategory.level;
    if (levelDiff !== 0 && currentCategory.children.length > 0) {
      // Update all descendant categories' levels
      await prisma.$transaction(
        currentCategory.children.map((child) =>
          prisma.category.update({
            where: { id: child.id },
            data: { level: child.level + levelDiff },
          })
        )
      );
    }

    const category = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        slug: slugify(name),
        description,
        level,
        image: image ? image : Prisma.JsonNull,
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

    // Get category to check for image and children
    const category = await prisma.category.findUnique({
      where: { id: params.categoryId },
      include: {
        children: true,
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Check if category has children
    if (category.children.length > 0) {
      return new NextResponse(
        "Cannot delete category with child categories. Please remove or reassign child categories first.",
        { status: 400 }
      );
    }

    // Delete image if exists
    if (category?.image) {
      const imageData = category.image as FileUploadThing;
      await utapi.deleteFiles(imageData.key);
    }

    // Delete category
    await prisma.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
