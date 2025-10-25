import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        options: {
          include: {
            values: true,
          },
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
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
      categoryId,
      collectionId,
      images,
      features,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug;
    if (name !== existingProduct.name) {
      const baseSlug = name.toLowerCase().replace(/\s+/g, "-");
      slug = baseSlug;
      
      // Check if slug exists and append timestamp if it does
      while (await prisma.product.findFirst({ 
        where: { 
          slug,
          NOT: { id }
        } 
      })) {
        slug = `${baseSlug}-${Date.now()}`;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        brand,
        material,
        gender,
        style,
        images,
        features,
        category: {
          connect: {
            id: categoryId,
          },
        },
        collection: collectionId && collectionId !== "none" ? {
          connect: {
            id: collectionId,
          },
        } : {
          disconnect: true,
        },
      },
      include: {
        category: true,
        collection: true,
        options: {
          include: {
            values: true,
          },
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        orderItems: true,
      },
    });

    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check if product has orders
    if (existingProduct.orderItems.length > 0) {
      return new NextResponse("Cannot delete product with existing orders", { status: 400 });
    }

    // Delete product (this will cascade delete variants and options)
    await prisma.product.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}