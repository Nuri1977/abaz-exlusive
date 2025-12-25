import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        collection: true,
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            stock: true,
            options: {
              select: {
                optionValue: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
      gender: string;
      style: string;
      images: Record<string, unknown>[];
      options: { name: string; values: string[] }[];
      variants: {
        sku: string;
        price: string;
        compareAtPrice?: string;
        stock: string;
        images: Record<string, unknown>[];
        options: { optionName: string; value: string }[];
      }[];
      categoryId: string;
      collectionId?: string;
    };
    const {
      name,
      description,
      price,
      compareAtPrice,
      brand,
      gender,
      style,
      images,
      options,
      variants,
      categoryId,
      collectionId,
    } = body;

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // Get or create default category
    let category = await prisma.category.findFirst({
      where: {
        name: "Shoes",
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Shoes",
          slug: "shoes",
          description: "All types of shoes",
          image: undefined,
        },
      });
    }

    const baseSlug = name.toLowerCase().replace(/\s+/g, "-");
    let slug = baseSlug;

    // Check if slug exists and append timestamp if it does
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        brand,
        gender,
        style,
        images: images as Prisma.InputJsonValue[],
        category: {
          connect: {
            id: categoryId || category.id,
          },
        },
        collection:
          collectionId && collectionId !== "none"
            ? {
                connect: {
                  id: collectionId,
                },
              }
            : undefined,
        options: {
          create: options.map((option) => ({
            name: option.name,
            values: {
              create: option.values
                .filter((value: string) => value.trim() !== "")
                .map((value: string) => ({
                  value,
                })),
            },
          })),
        },
      },
      include: {
        options: {
          include: {
            values: true,
          },
        },
      },
    });

    // Create variants after the product and its options are created
    if (variants.length > 0) {
      const createdProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          options: {
            include: {
              values: true,
            },
          },
        },
      });

      if (!createdProduct) {
        throw new Error("Failed to create product");
      }

      // Create variants with proper option value connections
      await Promise.all(
        variants.map(async (variant, index: number) => {
          const optionConnections = await Promise.all(
            variant.options.map(async (option) => {
              const productOption = createdProduct.options.find(
                (o) => o.name === option.optionName
              );
              if (!productOption) {
                throw new Error(`Option ${option.optionName} not found`);
              }

              const optionValue = productOption.values.find(
                (v) => v.value === option.value
              );
              if (!optionValue) {
                throw new Error(
                  `Value ${option.value} not found for option ${option.optionName}`
                );
              }

              return {
                optionValue: {
                  connect: {
                    id: optionValue.id,
                  },
                },
              };
            })
          );

          // Generate unique SKU using product ID and index
          const uniqueSku = `${variant.sku}-${product.id}-${index}`;

          const newVariant = await prisma.productVariant.create({
            data: {
              product: {
                connect: {
                  id: product.id,
                },
              },
              sku: uniqueSku,
              price: variant.price ? parseFloat(variant.price) : null,
              compareAtPrice: variant.compareAtPrice
                ? parseFloat(variant.compareAtPrice)
                : null,
              stock: parseInt(variant.stock),
              images: (variant.images ?? []) as Prisma.InputJsonValue[],
              options: {
                create: optionConnections,
              },
            } as unknown as Prisma.ProductVariantCreateInput,
          });

          // Create localized inventory item
          await prisma.inventoryItem.create({
            data: {
              sku: uniqueSku,
              quantity: parseInt(variant.stock),
              variantId: newVariant.id,
            },
          });

          return newVariant;
        })
      );
    }

    // Fetch the complete product with all relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
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

    return NextResponse.json(completeProduct);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
