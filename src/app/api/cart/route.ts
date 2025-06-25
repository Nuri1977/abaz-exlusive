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

  return NextResponse.json({ data: cart?.items ?? [] }, { status: 200 });
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
    // Find existing cart item by cartId, productId, and variantId (can be null)
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId ?? null,
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
            : {}),
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
  const productId = searchParams.get("productId");
  const variantId = searchParams.get("variantId");

  if (productId) {
    // Remove by productId and (optional) variantId
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    if (!cart) return new NextResponse(null, { status: 204 });
    const where: any = { cartId: cart.id, productId };
    if (variantId) {
      where.variantId = variantId;
    } else {
      where.variantId = null;
    }
    await prisma.cartItem.deleteMany({ where });
    return new NextResponse(null, { status: 204 });
  } else {
    // Remove all items from cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return new NextResponse(null, { status: 204 });
  }
}
