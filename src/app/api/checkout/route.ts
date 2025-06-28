import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/schemas/checkout";

import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/helpers/getSessionServer";

// Helper to get cart items for logged-in users only
async function getCartItems(userId: string) {
  // Logged-in user: fetch cart from DB
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  return cart?.items || [];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionServer();
    const userId = session?.user?.id;
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const form = parsed.data;

    let cartItems: any[] = [];
    if (userId) {
      cartItems = await getCartItems(userId);
    } else {
      // For guests, the client must send cart items in the request body as `cartItems` (from localStorage)
      cartItems = body.cartItems || [];
    }
    if (!cartItems?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate all cart items have required fields
    for (const item of cartItems) {
      if (
        !item.quantity ||
        !item.price ||
        (!item.productId && !item.variantId)
      ) {
        return NextResponse.json(
          { error: "Invalid cart item data" },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    // Create order and order items
    const orderData: any = {
      status: "PENDING",
      total,
      shippingAddress: form.address,
      billingAddress: form.address, // No separate billing for now
      paymentStatus: "PENDING",
      phone: form.phone,
      items: {
        create: cartItems.map((item: any) => {
          const orderItem: any = {
            quantity: item.quantity,
            price: item.price,
          };
          if (item.variantId) {
            orderItem.variant = { connect: { id: item.variantId } };
          }
          if (item.productId) {
            orderItem.Product = { connect: { id: item.productId } };
          }
          return orderItem;
        }),
      },
    };
    if (userId) orderData.userId = userId;

    let order;
    try {
      order = await prisma.order.create({
        data: orderData,
        include: { items: true },
      });
    } catch (err) {
      console.error("Order creation failed:", err);
      return NextResponse.json(
        { error: "Order creation failed", details: String(err) },
        { status: 500 }
      );
    }

    // Clear cart
    if (userId) {
      await prisma.cart.update({
        where: { userId },
        data: { items: { deleteMany: {} }, total: 0 },
      });
    }
    // For guests, client should clear cart in localStorage after successful order

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Checkout API error:", err);
    return NextResponse.json(
      { error: "Failed to process order", details: String(err) },
      { status: 500 }
    );
  }
}
