import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/helpers/getSessionServer";

export async function GET(req: NextRequest) {
  const session = await getSessionServer();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              options: {
                include: {
                  optionValue: true,
                },
              },
              product: true,
            },
          },
          Product: true,
        },
      },
    },
  });

  return Response.json(cart?.items ?? []);
}

export async function POST(req: NextRequest) {
  const session = await getSessionServer();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, variantId, quantity, price } = body;

  if (!productId || !quantity || !price) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  let cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id, total: 0 },
  });

  try {
    // If a variant is specified, look for that specific variant in the cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        ...(variantId ? { variantId } : {}),
      },
    });

    let item;
    if (existingCartItem) {
      // Update existing cart item
      item = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Create new cart item
      item = await prisma.cartItem.create({
        data: {
          cart: {
            connect: { id: cart.id },
          },
          Product: {
            connect: { id: productId },
          },
          ...(variantId
            ? {
                variant: {
                  connect: { id: variantId },
                },
              }
            : {
                variant: {
                  connect: {
                    id: await getDefaultVariant(productId),
                  },
                },
              }),
          quantity,
          price,
        },
      });
    }

    // Update cart total
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        total: {
          increment: price * quantity,
        },
      },
    });

    return Response.json(item);
  } catch (error) {
    console.error("Cart operation failed:", error);
    return NextResponse.json(
      { message: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionServer();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (itemId) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return new Response(null, { status: 204 });
  } else {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return new Response(null, { status: 204 });
  }
}

// Helper function to get default variant for a product
async function getDefaultVariant(productId: string): Promise<string> {
  const variant = await prisma.productVariant.findFirst({
    where: { productId },
    orderBy: { createdAt: "asc" },
  });

  if (!variant) {
    throw new Error(`No variant found for product ${productId}`);
  }

  return variant.id;
}
