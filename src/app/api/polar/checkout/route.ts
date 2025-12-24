import { NextResponse, type NextRequest } from "next/server";
import { PolarCheckoutInputSchema } from "@/schemas/polar-checkout";

import {
  buildCartMetadata,
  type InputCartItem,
} from "@/lib/cart-metadata-builder";
import {
  prepareCheckoutSessionData,
  validateCheckoutData,
} from "@/lib/checkout-utils";
import { CurrencyConverter } from "@/lib/currency-converter";
import { prisma } from "@/lib/prisma";
import { ExchangeRateService } from "@/services/exchange-rate";
import { OrderService } from "@/services/order";
import { PaymentService } from "@/services/payment";
import { PolarService } from "@/services/polar";
import { getSessionServer } from "@/helpers/getSessionServer";

// Handle POST requests for creating checkout sessions
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

    // Get session for authenticated users
    const session = await getSessionServer();

    // Prepare checkout session data
    // Use the provided amount instead of calculating from cart items
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

    // Handle different payment methods
    if (sessionData.paymentMethod === "CASH_ON_DELIVERY") {
      // Handle cash payment - create order and payment without Polar
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
        },
      };

      const payment = await PaymentService.createPayment(paymentData);

      // Update payment status to CASH_PENDING
      await PaymentService.updatePaymentStatus(payment.id, {
        status: "CASH_PENDING",
      });

      // Return success response for cash payment
      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentId: payment.id,
        paymentMethod: "CASH_ON_DELIVERY",
        message: "Order created successfully. You will pay cash on delivery.",
      });
    } else {
      // Handle card payment - use Polar

      // Check for generic product ID configuration
      if (!process.env.POLAR_GENERIC_PRODUCT_ID) {
        return NextResponse.json(
          {
            error: "Polar configuration error",
            message:
              "POLAR_GENERIC_PRODUCT_ID is missing in server configuration.",
          },
          { status: 500 }
        );
      }

      // Check for app URL configuration
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) {
        return NextResponse.json(
          {
            error: "Configuration error",
            message: "NEXT_PUBLIC_APP_URL is missing in server configuration.",
          },
          { status: 500 }
        );
      }

      // Create local order first
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
        items: OrderService.convertCartItemsToOrderItems(sessionData.cartItems),
      };

      const order = await OrderService.createOrder(orderData);

      // 1. Fetch Exchange Rates
      // We need exchange rates to convert to USD (if not already USD)
      const exchangeRates = await ExchangeRateService.getExchangeRates("MKD");

      // 2. Convert to Polar Currency (USD)
      const conversion = CurrencyConverter.convertToPolarCurrency(
        sessionData.amount,
        sessionData.currency as "MKD" | "USD" | "EUR",
        exchangeRates
      );

      // 3. Create payment record
      // Store original currency/amount and conversion details
      const paymentData = {
        orderId: order.id,
        amount: sessionData.amount,
        currency: sessionData.currency,
        method: sessionData.paymentMethod,
        provider: "polar",
        customerEmail: sessionData.email,
        customerName: sessionData.customerName,
        metadata: {
          cartItems: sessionData.cartItems,
          environment: process.env.POLAR_ENVIRONMENT || "sandbox",
          // Currency conversion info
          originalAmount: sessionData.amount,
          originalCurrency: sessionData.currency,
          convertedAmount: conversion.convertedAmount,
          convertedCurrency: conversion.convertedCurrency,
          exchangeRate: conversion.exchangeRate,
        },
      };

      const payment = await PaymentService.createPayment(paymentData);

      // 4. Build Metadata for Polar with Enhanced Product Data
      const cartItemsForMetadata: InputCartItem[] = [];

      // Fetch complete product details for metadata
      for (const item of input.cartItems || []) {
        try {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              variants: {
                where: item.variantId ? { id: item.variantId } : undefined,
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

          if (product) {
            const variant = product.variants?.[0];
            const variantOptions = variant?.options
              ?.map(
                (opt) =>
                  `${opt.optionValue?.option?.name}: ${opt.optionValue?.value}`
              )
              .filter(Boolean)
              .join(", ");

            // Handle images stored as JSON array
            const images = Array.isArray(product.images) ? product.images : [];
            const firstImage = images[0] as
              | { url?: string; key?: string }
              | undefined;
            const imageUrl = firstImage?.url || firstImage?.key || "";

            cartItemsForMetadata.push({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              title: product.name || item.title || "Unknown Product",
              // Enhanced metadata
              productSlug: product.slug || "",
              imageUrl: imageUrl,
              variantSku: variant?.sku || "",
              variantOptions: variantOptions || undefined,
            });
          } else {
            // Fallback if product not found
            cartItemsForMetadata.push({
              ...item,
              title: item.title || "Unknown Product",
              productSlug: "",
              imageUrl: "",
              variantSku: "",
            });
          }
        } catch (error) {
          console.error(`Failed to fetch product ${item.productId}:`, error);
          // Fallback if database query fails
          cartItemsForMetadata.push({
            ...item,
            title: item.title || "Unknown Product",
            productSlug: "",
            imageUrl: "",
            variantSku: "",
          });
        }
      }

      const metadata = buildCartMetadata(
        cartItemsForMetadata,
        order.id,
        sessionData.email || "",
        {
          userId: sessionData.userId,
          customerName: sessionData.customerName,
          deliveryAddress: sessionData.shippingAddress,
          deliveryNotes: sessionData.deliveryNotes,
          currency: sessionData.currency,
        }
      );

      // 5. Create Polar Checkout
      const checkout = await PolarService.createCustomAmountCheckout(
        process.env.POLAR_GENERIC_PRODUCT_ID,
        conversion.convertedAmount, // USD amount
        "USD",
        metadata,
        sessionData.email || "",
        sessionData.customerName,
        `${appUrl}/checkout/success?orderId=${order.id}&paymentId=${payment.id}`,
        `${appUrl}/checkout/cancel?orderId=${order.id}`
      );

      // Update payment with checkout ID
      if (checkout.checkoutId) {
        await PaymentService.updatePaymentStatus(payment.id, {
          checkoutId: checkout.checkoutId,
        });
      }

      return NextResponse.json({
        success: true,
        url: checkout.checkoutUrl,
        orderId: order.id,
        paymentId: payment.id,
        checkoutId: checkout.checkoutId,
      });
    }
  } catch (error: unknown) {
    console.error("Checkout creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
