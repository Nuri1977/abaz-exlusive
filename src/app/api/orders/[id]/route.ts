import { NextResponse, type NextRequest } from "next/server";

import { OrderService } from "@/services/order";
import { getSessionServer } from "@/helpers/getSessionServer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get session to check if user can access this order
    const session = await getSessionServer();

    // Find the order
    const order = await OrderService.findOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has permission to view this order
    // Allow if: user owns the order, or it's a guest order with matching email, or user is admin
    const canAccess =
      !order.userId || // Guest order
      order.userId === session?.user?.id || // User owns order
      session?.user?.isAdmin; // Admin access

    if (!canAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Return order data with payment information
    return NextResponse.json({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      currency: order.currency,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      phone: order.phone,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        Product: item.Product
          ? {
              id: item.Product.id,
              name: item.Product.name,
              slug: item.Product.slug,
              images: item.Product.images,
            }
          : null,
        variant: (() => {
          const variant = item.variant as unknown as {
            id: string;
            sku: string;
            options?: Array<{
              optionValue: {
                value: string;
                option: {
                  name: string;
                };
              };
            }>;
          };

          if (!variant) return null;

          const variantOptions: { name: string; value: string }[] = [];

          if (variant.options) {
            variant.options.forEach((opt) => {
              const name = opt.optionValue?.option?.name ?? "";
              const value = opt.optionValue?.value ?? "";
              variantOptions.push({ name, value });
            });
          }
          return {
            id: variant.id,
            sku: variant.sku,
            variantOptions,
          };
        })(),
      })),
      payments: order.payments?.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        paymentMethod: payment.method,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      // Latest payment for quick access
      latestPayment: order.payments?.[0]
        ? {
            id: order.payments[0].id,
            status: order.payments[0].status,
            paymentMethod: order.payments[0].method,
            createdAt: order.payments[0].createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
