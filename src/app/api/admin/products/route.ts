import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
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

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
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

    const body = await req.json();
    const {
      name,
      description,
      price,
      brand,
      gender,
      style,
      images,
      options,
      variants,
      categoryId,
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
    let counter = 1;

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
        brand,
        gender,
        style,
        images,
        category: {
          connect: {
            id: categoryId || category.id,
          },
        },
        options: {
          create: options.map((option: any) => ({
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
        variants.map(async (variant: any, index: number) => {
          const optionConnections = await Promise.all(
            variant.options.map(async (option: any) => {
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

          return prisma.productVariant.create({
            data: {
              product: {
                connect: {
                  id: product.id,
                },
              },
              sku: uniqueSku,
              price: variant.price ? parseFloat(variant.price) : null,
              stock: parseInt(variant.stock),
              options: {
                create: optionConnections,
              },
            },
          });
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
