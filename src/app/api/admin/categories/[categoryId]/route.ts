import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { type FileUploadThing } from "@/types/UploadThing";
import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { utapi } from "@/utils/utapi";

interface CategoryIdParams {
  params: Promise<{
    categoryId: string;
  }>;
}

export async function PATCH(req: Request, { params }: CategoryIdParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = await params;
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      image?: Prisma.InputJsonValue;
      parentId?: string;
    };
    const { name, description, image, parentId } = body;

    if (!name || typeof name !== "string") {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Get current category to check for existing image and current parent
    const currentCategory = await prisma.category.findUnique({
      where: { id: categoryId },
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
          return new NextResponse("Cannot set category as its own parent", {
            status: 400,
          });
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
          return new NextResponse("Cannot set a child category as parent", {
            status: 400,
          });
        }
        level = parent.level + 1;
      }
    }

    // If there's an existing image and it's being updated, delete the old one
    if (currentCategory?.image && image && typeof image !== "string") {
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
        id: categoryId,
      },
      data: {
        name,
        slug: slugify(name),
        description,
        level,
        image: image ? image : Prisma.JsonNull,
        parent: parentId
          ? {
              connect: { id: parentId },
            }
          : {
              disconnect: true,
            },
      },
      include: {
        parent: true,
        children: true,
      },
    });

    revalidateTag(SSGCacheKeys.categories);
    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: CategoryIdParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = await params;

    // Get category to check for image and children
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    // Delete category first
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    // Delete image from UploadThing and Gallery after successful category deletion
    if (category?.image) {
      try {
        const imageData = category.image as FileUploadThing;
        console.error(
          "Deleting category image from UploadThing:",
          imageData.key
        );

        // Delete from UploadThing
        const uploadThingResponse = await utapi.deleteFiles(imageData.key);
        console.error("UploadThing deletion response:", uploadThingResponse);

        // Delete from Gallery database by key
        await prisma.gallery.deleteMany({
          where: { key: imageData.key },
        });

        // Also try to delete by URL if key deletion didn't work
        if (imageData.url) {
          await prisma.gallery.deleteMany({
            where: { url: imageData.url },
          });
        }

        // Delete by ufsUrl if it exists
        if (imageData.ufsUrl) {
          await prisma.gallery.deleteMany({
            where: { url: imageData.ufsUrl },
          });
        }

        console.error("Deleted category image from Gallery database");
      } catch (imageError) {
        console.error("Error deleting category image:", imageError);
        // Don't fail the entire operation if image deletion fails
        // The category is already deleted, so we just log the error
      }
    }

    revalidateTag(SSGCacheKeys.categories);
    return NextResponse.json({
      success: true,
      message:
        "Category deleted successfully" +
        (category?.image ? " along with associated image" : ""),
    });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
