import { NextResponse, type NextRequest } from "next/server";
import { PolarCheckoutInputSchema } from "@/schemas/polar-checkout";

import {
  prepareCheckoutSessionData,
  validateCheckoutData,
} from "@/lib/checkout-utils";
import { OrderService } from "@/services/order";
import { PaymentService } from "@/services/payment";
import { getSessionServer } from "@/helpers/getSessionServer";

// Handle POST requests for creating cash payment orders
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body: unknown = await req.json();
    const validationResult = PolarCheckoutInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Ensure this is a cash payment
    if (input.paymentMethod !== "CASH_ON_DELIVERY") {
      return NextResponse.json(
        {
          error: "Invalid payment method for this endpoint",
        },
        { status: 400 }
      );
    }

    // Get session for authenticated users
    const session = await getSessionServer();

    // Prepare checkout session data
    const sessionData = prepareCheckoutSessionData(
      input.cartItems || [],
      input.currency,
      input.paymentMethod,
      {
        userId: session?.user?.id || input.userId,
        email: session?.user?.email || input.email,
        name: session?.user?.name || input.customerName,
        phone: input.phone,
      },
      {
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
      },
      {
        deliveryNotes: input.deliveryNotes,
      }
    );

    // Override the calculated amount with the provided amount
    sessionData.amount = input.amount;

    // Validate checkout data
    const validation = validateCheckoutData(sessionData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid checkout data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create local order for cash payment
    const orderData = {
      userId: sessionData.userId,
      total: sessionData.amount,
      currency: sessionData.currency,
      customerEmail: sessionData.email,
      customerName: sessionData.customerName,
      phone: sessionData.phone,
      shippingAddress: sessionData.shippingAddress,
      billingAddress: sessionData.billingAddress,
      paymentMethod: sessionData.paymentMethod,
      deliveryNotes: sessionData.deliveryNotes,
      deliveryDate: input.deliveryDate
        ? new Date(input.deliveryDate)
        : undefined,
      items: OrderService.convertCartItemsToOrderItems(sessionData.cartItems),
    };

    const order = await OrderService.createOrder(orderData);

    // Create cash payment record
    const paymentData = {
      orderId: order.id,
      amount: sessionData.amount,
      currency: sessionData.currency,
      method: sessionData.paymentMethod,
      provider: "cash",
      customerEmail: sessionData.email,
      customerName: sessionData.customerName,
      deliveryAddress: sessionData.shippingAddress,
      deliveryNotes: sessionData.deliveryNotes,
      metadata: {
        cartItems: sessionData.cartItems,
        paymentMethod: "cash_on_delivery",
        deliveryDate: input.deliveryDate,
      },
    };

    const payment = await PaymentService.createPayment(paymentData);

    // Update payment status to CASH_PENDING
    await PaymentService.updatePaymentStatus(payment.id, {
      status: "CASH_PENDING",
    });

    // Update order status to PROCESSING (order confirmed, awaiting delivery)
    await OrderService.updateOrderStatus(order.id, "PROCESSING");

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: payment.id,
      paymentMethod: "CASH_ON_DELIVERY",
      message: "Order created successfully. You will pay cash on delivery.",
      order: {
        id: order.id,
        total: order.total,
        currency: order.currency,
        status: "PROCESSING",
        paymentStatus: "CASH_PENDING",
        deliveryDate: order.deliveryDate,
        deliveryNotes: order.deliveryNotes,
      },
    });
  } catch (error) {
    console.error("Cash checkout creation error:", error);
    return NextResponse.json(
      { error: "Failed to create cash payment order" },
      { status: 500 }
    );
  }
}
