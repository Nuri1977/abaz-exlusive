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
    const { name, description, image } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Get current category to check for existing image
    const currentCategory = await prisma.category.findUnique({
      where: { id: params.categoryId },
    });

    // If there's an existing image and it's being updated, delete the old one
    if (currentCategory?.image && image) {
      const oldImage = currentCategory.image as FileUploadThing;
      await utapi.deleteFiles(oldImage.key);
    }

    const category = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        slug: slugify(name),
        description,
        image: image ? image : Prisma.JsonNull,
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

    // Get category to check for image
    const category = await prisma.category.findUnique({
      where: { id: params.categoryId },
    });

    // Delete image if exists
    if (category?.image) {
      const imageData = JSON.parse(category.image as string) as FileUploadThing;
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
