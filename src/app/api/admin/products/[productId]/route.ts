import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface ProductIdParams {
  params: Promise<{
    productId: string;
  }>;
}

export async function PATCH(req: Request, { params }: ProductIdParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { productId } = await params;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      brand,
      material,
      gender,
      style,
      features,
      categoryId,
      images,
    } = body;

    if (!name || !price || !categoryId || !images?.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate base slug from name
    const baseSlug = slugify(name);
    let slug = baseSlug;

    // Check if the slug would conflict with any other product (excluding the current one)
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        NOT: {
          id: productId,
        },
      },
    });

    // If there's a conflict, append a timestamp to make it unique
    if (existingProduct) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        slug,
        description,
        price,
        brand,
        material,
        gender,
        style,
        features,
        categoryId,
        images,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: ProductIdParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { productId } = await params;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
