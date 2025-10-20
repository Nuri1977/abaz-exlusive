import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { utapi } from "@/utils/utapi";

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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return new NextResponse("Forbidden - Admin access required", {
        status: 403,
      });
    }

    // Check if product exists and get its images
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Extract image keys from product images for deletion
    const imageKeys: string[] = [];
    const imageUrls: string[] = [];

    if (existingProduct?.images && Array.isArray(existingProduct?.images)) {
      for (const image of existingProduct?.images) {
        if (typeof image === "object" && image !== null) {
          if ("key" in image && typeof image.key === "string") {
            imageKeys.push(image.key);
          }
          if ("url" in image && typeof image.url === "string") {
            imageUrls.push(image.url);
          }
        }
      }
    }

    // Delete related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete product variant options first
      if (existingProduct?.variants?.length > 0) {
        for (const variant of existingProduct?.variants) {
          await tx.productVariantOption.deleteMany({
            where: { variantId: variant?.id },
          });
        }

        // Delete product variants
        await tx.productVariant.deleteMany({
          where: { productId },
        });
      }

      // Delete cart items
      await tx.cartItem.deleteMany({
        where: { productId },
      });

      // Delete order items (be careful with this - might want to keep order history)
      // For now, we'll prevent deletion if there are order items
      const orderItemsCount = await tx.orderItem.count({
        where: { productId },
      });

      if (orderItemsCount > 0) {
        throw new Error(
          "Cannot delete product: it has been ordered by customers"
        );
      }

      // Delete likes
      await tx.like.deleteMany({
        where: { productId },
      });

      // Delete from new arrivals
      await tx.newArrivals.deleteMany({
        where: { productId },
      });

      // Delete from best sellers
      await tx.bestSellers.deleteMany({
        where: { productId },
      });

      // Delete the product
      await tx.product.delete({
        where: { id: productId },
      });
    });

    // Delete images from UploadThing and Gallery after successful product deletion
    if (imageKeys.length > 0) {
      try {
        // Delete from UploadThing
        console.log("Deleting images from UploadThing:", imageKeys);
        const uploadThingResponse = await utapi.deleteFiles(imageKeys);
        console.log("UploadThing deletion response:", uploadThingResponse);

        // Delete from Gallery database
        for (const imageKey of imageKeys) {
          await prisma.gallery.deleteMany({
            where: { key: imageKey },
          });
        }

        // Also try to delete by URL if key deletion didn't work
        for (const imageUrl of imageUrls) {
          await prisma.gallery.deleteMany({
            where: { url: imageUrl },
          });
        }

        console.log(`Deleted ${imageKeys.length} images from Gallery`);
      } catch (imageError) {
        console.error("Error deleting images:", imageError);
        // Don't fail the entire operation if image deletion fails
        // The product is already deleted, so we just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Product deleted successfully${imageKeys.length > 0 ? ` along with ${imageKeys.length} associated images` : ""}`,
      deletedImages: imageKeys.length,
    });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return new NextResponse(
          "Cannot delete product: it has related records",
          { status: 400 }
        );
      }
      if (error.message.includes("Record to delete does not exist")) {
        return new NextResponse("Product not found", { status: 404 });
      }
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}
