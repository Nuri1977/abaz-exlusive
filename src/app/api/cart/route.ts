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
  // body: { productId, variantId, quantity, price, image, title }
  const { productId, variantId, quantity, price } = body;

  let cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id, total: 0 },
  });

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      variantId,
    },
  });

  let item;
  if (existing) {
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        price,
      },
    });
  }

  return Response.json(item);
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
