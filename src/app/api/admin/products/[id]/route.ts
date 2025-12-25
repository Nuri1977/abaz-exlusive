import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

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
                optionValue: {
                  include: {
                    option: true,
                  },
                },
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

    const body = (await req.json()) as {
      name: string;
      description: string;
      price: string;
      compareAtPrice?: string;
      brand: string;
      material?: string;
      gender: string;
      style: string;
      categoryId: string;
      collectionId?: string;
      images: Prisma.InputJsonValue[];
      features?: string[];
      options?: { name: string; values: string[] }[];
      variants?: {
        sku: string;
        price: string;
        compareAtPrice?: string;
        stock: string | number;
        options: { optionName: string; value: string }[];
        images?: Prisma.InputJsonValue[];
      }[];
    };

    const {
      name,
      description,
      price,
      compareAtPrice,
      brand,
      material,
      gender,
      style,
      categoryId,
      collectionId,
      images,
      features,
      options,
      variants,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            values: true,
          },
        },
        variants: true,
      },
    });

    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      const baseSlug = name.toLowerCase().replace(/\s+/g, "-");
      slug = baseSlug;

      while (
        await prisma.product.findFirst({
          where: {
            slug,
            NOT: { id },
          },
        })
      ) {
        slug = `${baseSlug}-${Date.now()}`;
      }
    }

    // Update product in a transaction
    const updatedProduct = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Update basic info
        await tx.product.update({
          where: { id },
          data: {
            name,
            slug,
            description,
            price: price ? parseFloat(price) : undefined,
            compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
            brand,
            material,
            gender,
            style,
            images: images,
            features,
            category: categoryId
              ? {
                  connect: { id: categoryId },
                }
              : undefined,
            collection:
              collectionId && collectionId !== "none"
                ? {
                    connect: { id: collectionId },
                  }
                : {
                    disconnect: true,
                  },
          },
        });

        // 2. If options are provided, sync them
        if (options) {
          // Delete existing options (cascades to values and variant options)
          await tx.productOption.deleteMany({
            where: { productId: id },
          });

          // Delete existing variants (cascades to inventory items)
          await tx.productVariant.deleteMany({
            where: { productId: id },
          });

          // Create new options
          await tx.product.update({
            where: { id },
            data: {
              options: {
                create: options.map((option) => ({
                  name: option.name,
                  values: {
                    create: option.values.map((value: string) => ({
                      value,
                    })),
                  },
                })),
              },
            },
          });
          // Fetch created options to link variants
          const productWithOptions = await tx.product.findUnique({
            where: { id },
            include: {
              options: {
                include: {
                  values: true,
                },
              },
            },
          });

          if (!productWithOptions)
            throw new Error("Failed to fetch product with options");

          // Create new variants
          if (variants && variants.length > 0) {
            for (let i = 0; i < variants.length; i++) {
              const variant = variants[i] as {
                sku: string;
                price: string;
                compareAtPrice?: string;
                stock: string | number;
                options: { optionName: string; value: string }[];
                images?: Prisma.InputJsonValue[];
              };
              const optionConnections = variant.options.map(
                (opt: { optionName: string; value: string }) => {
                  const productOption = productWithOptions.options.find(
                    (o: { name: string }) => o.name === opt.optionName
                  );
                  const optionValue = productOption?.values.find(
                    (v: { value: string }) => v.value === opt.value
                  );

                  if (!optionValue)
                    throw new Error(
                      `Option value not found: ${opt.optionName} - ${opt.value}`
                    );

                  return {
                    optionValue: {
                      connect: { id: optionValue.id },
                    },
                  };
                }
              );

              const uniqueSku = `${variant.sku}-${id}-${i}`;

              await tx.productVariant.create({
                data: {
                  product: {
                    connect: { id },
                  },
                  sku: uniqueSku,
                  price: variant.price
                    ? parseFloat(variant.price.toString())
                    : null,
                  compareAtPrice: variant.compareAtPrice
                    ? parseFloat(variant.compareAtPrice.toString())
                    : null,
                  stock: parseInt(variant.stock.toString()),
                  images: variant.images ?? [],
                  options: {
                    create: optionConnections,
                  },
                  inventory: {
                    create: {
                      sku: uniqueSku,
                      quantity: parseInt(variant.stock.toString()),
                    },
                  },
                } as Prisma.ProductVariantCreateInput,
              });
            }
          }
        }

        return tx.product.findUnique({
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
      },
      {
        timeout: 20000,
      }
    );

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
      return new NextResponse("Cannot delete product with existing orders", {
        status: 400,
      });
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
