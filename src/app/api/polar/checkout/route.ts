import { NextResponse, type NextRequest } from "next/server";
import { PolarCheckoutInputSchema } from "@/schemas/polar-checkout";

import type { UpdatePaymentData } from "@/types/polar";
import {
  prepareCheckoutSessionData,
  validateCheckoutData,
} from "@/lib/checkout-utils";
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

      // Create payment record for card payment
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
        },
      };

      const payment = await PaymentService.createPayment(paymentData);

      // Generate checkout URL for Polar NextJS handler
      // The GET handler will create the actual Polar checkout session
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutUrl = new URL(`${baseUrl}/api/polar/checkout`);

      // Add required query parameters for Polar NextJS handler
      // Note: We need a product ID for Polar, but we're using custom amounts
      // We'll create a dummy product or use a custom amount approach

      if (sessionData.email) {
        checkoutUrl.searchParams.set("customerEmail", sessionData.email);
      }

      if (sessionData.customerName) {
        checkoutUrl.searchParams.set("customerName", sessionData.customerName);
      }

      // Prepare metadata for Polar
      const metadata = PolarService.prepareCheckoutMetadata(
        sessionData,
        order.id,
        payment.id
      );

      // Add metadata as URL-encoded JSON string
      const encodedMetadata = PolarService.encodeMetadata(metadata);
      checkoutUrl.searchParams.set("metadata", encodedMetadata);

      // Add custom amount and currency (if supported by Polar)
      checkoutUrl.searchParams.set("amount", sessionData.amount.toString());
      checkoutUrl.searchParams.set("currency", sessionData.currency);

      const response = {
        url: checkoutUrl.toString(),
        orderId: order.id,
        paymentId: payment.id,
        success: true,
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle GET requests - Create Polar checkout session and redirect
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract parameters from URL
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");
    const customerEmail = searchParams.get("customerEmail");
    const customerName = searchParams.get("customerName");
    const metadata = searchParams.get("metadata");

    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Missing required parameters: amount, currency" },
        { status: 400 }
      );
    }

    // Check required environment variables
    if (!process.env.POLAR_ACCESS_TOKEN) {
      console.error("❌ POLAR_ACCESS_TOKEN not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    if (!process.env.POLAR_GENERIC_PRODUCT_ID) {
      console.warn(
        "⚠️ POLAR_GENERIC_PRODUCT_ID not configured, using fallback"
      );
    }

    // Import Polar SDK
    const { Polar } = await import("@polar-sh/sdk");

    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server:
        process.env.POLAR_ENVIRONMENT === "production"
          ? "production"
          : "sandbox",
    });

    // Parse metadata and filter to Polar-compatible types
    const parsedMetadata: Record<string, string | number | boolean> = {};
    if (metadata) {
      try {
        const parsed: unknown = JSON.parse(decodeURIComponent(metadata));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const rawMetadata = parsed as Record<string, unknown>;

          // Filter metadata to only include string, number, boolean values
          for (const [key, value] of Object.entries(rawMetadata)) {
            if (
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            ) {
              parsedMetadata[key] = value;
            } else if (value !== null && value !== undefined) {
              // Convert complex types to JSON string for Polar compatibility
              try {
                parsedMetadata[key] = JSON.stringify(value);
              } catch {
                // Fallback: skip values that can't be serialized
                console.warn(
                  `Skipping metadata field '${key}' - cannot serialize value`
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse metadata:", error);
      }
    }

    // Create checkout session with custom amount

    // Convert to USD for Polar (Polar only supports USD, EUR, etc.)

    let finalAmount: number;
    let conversionRate: number;

    // Convert different currencies to USD for Polar
    if (currency === "MKD") {
      // MKD to USD: 1 USD = 61.5 MKD (approximate)
      // Amount comes as MKD (e.g., 110000), convert to USD
      conversionRate = 61.5;
      finalAmount = Math.round((parseInt(amount) / conversionRate) * 100) / 100; // Round to 2 decimals
    } else if (currency === "EUR") {
      // EUR to USD: 1 EUR = 1.1 USD (approximate)
      // Amount comes as EUR cents, convert to USD
      conversionRate = 1.1; // 1 EUR = 1.1 USD
      finalAmount =
        Math.round((parseInt(amount) / 100) * conversionRate * 100) / 100;
    } else if (currency === "USD") {
      // Already USD - amount comes as cents
      conversionRate = 1;
      finalAmount = parseInt(amount) / 100; // Convert from cents to dollars
    } else {
      // Fallback: treat as USD cents
      console.warn("Unknown currency, treating as USD cents:", currency);
      conversionRate = 1;
      finalAmount = parseInt(amount) / 100;
    }

    // Let Polar handle minimum amount validation

    const amountInCents = Math.round(finalAmount * 100);

    // Create checkout session with custom amount

    // Create checkout session using Polar's API
    // Since Polar requires products, we'll create a dynamic approach
    let checkoutSession;

    // Check if we have a generic product ID for ad-hoc pricing
    if (!process.env.POLAR_GENERIC_PRODUCT_ID) {
      return NextResponse.json(
        {
          error: "Polar product configuration required",
          message:
            "To enable card payments, create one generic product in your Polar dashboard.",
          instructions: [
            "1. Go to https://polar.sh/dashboard",
            "2. Create a new product (name: 'Generic Payment' or similar)",
            "3. Set any base price (we'll override it with custom amounts)",
            "4. Copy the product ID from the URL or product settings",
            "5. Add POLAR_GENERIC_PRODUCT_ID=your_product_id to your .env file",
          ],
          fallbackAvailable: true,
          suggestion: "Use 'Cash on Delivery' payment method for now",
        },
        { status: 503 }
      );
    }

    try {
      // ✅ CORRECT AD-HOC PRICING: Use product_price_overrides for dynamic amounts

      // ✅ Use correct ad-hoc pricing with prices parameter
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${parsedMetadata.orderId || ""}&paymentId=${parsedMetadata.paymentId || ""}`;
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?orderId=${parsedMetadata.orderId || ""}`;

      checkoutSession = await polar.checkouts.create({
        // Use the generic product
        products: [process.env.POLAR_GENERIC_PRODUCT_ID],

        // 🎯 KEY: Use prices mapping for ad-hoc price creation (ProductPriceFixedCreate schema)
        prices: {
          [process.env.POLAR_GENERIC_PRODUCT_ID]: [
            {
              amountType: "fixed", // camelCase as expected by SDK
              priceAmount: amountInCents, // Amount in cents (USD) - camelCase
              priceCurrency: "usd", // Must be "usd" as per documentation - camelCase
            },
          ],
        },

        customerEmail: customerEmail || undefined,
        customerName: customerName || undefined,
        successUrl: successUrl,
        returnUrl: cancelUrl,
        metadata: {
          ...parsedMetadata,
          // Store original amounts for reference
          originalAmount: amount, // Original amount in original currency
          originalCurrency: currency, // Original currency
          convertedAmount: finalAmount.toString(), // USD amount
          conversionRate: conversionRate.toString(), // Conversion rate used
          polarCurrency: "USD", // Currency sent to Polar
          // Enhanced cart data for order processing
          cartData: JSON.stringify({
            items: (() => {
              try {
                if (
                  parsedMetadata.cartSummary &&
                  typeof parsedMetadata.cartSummary === "string"
                ) {
                  const parsed: unknown = JSON.parse(
                    parsedMetadata.cartSummary
                  );
                  return parsed &&
                    typeof parsed === "object" &&
                    !Array.isArray(parsed)
                    ? parsed
                    : {};
                }
                return {};
              } catch {
                return {};
              }
            })(),
            productIds: (() => {
              try {
                if (
                  parsedMetadata.productIds &&
                  typeof parsedMetadata.productIds === "string"
                ) {
                  const parsed: unknown = JSON.parse(parsedMetadata.productIds);
                  if (Array.isArray(parsed)) {
                    // Validate that all items are strings (product IDs should be strings)
                    return parsed.filter(
                      (item): item is string => typeof item === "string"
                    );
                  }
                }
                return [];
              } catch {
                return [];
              }
            })(),
            variantIds: (() => {
              try {
                if (
                  parsedMetadata.variantIds &&
                  typeof parsedMetadata.variantIds === "string"
                ) {
                  const parsed: unknown = JSON.parse(parsedMetadata.variantIds);
                  if (Array.isArray(parsed)) {
                    // Validate that all items are strings (variant IDs should be strings)
                    return parsed.filter(
                      (item): item is string => typeof item === "string"
                    );
                  }
                }
                return [];
              } catch {
                return [];
              }
            })(),
            customerInfo: (() => {
              try {
                if (
                  parsedMetadata.customerInfo &&
                  typeof parsedMetadata.customerInfo === "string"
                ) {
                  const parsed: unknown = JSON.parse(
                    parsedMetadata.customerInfo
                  );
                  return parsed &&
                    typeof parsed === "object" &&
                    !Array.isArray(parsed)
                    ? parsed
                    : {};
                }
                return {};
              } catch {
                return {};
              }
            })(),
          }),
        },
      });
    } catch (adHocPriceError) {
      console.error("❌ Ad-hoc pricing failed:", adHocPriceError);
      console.error("Error details:", JSON.stringify(adHocPriceError, null, 2));

      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: "Card payment configuration error",
          message: "Unable to create checkout with custom amount",
          details:
            adHocPriceError instanceof Error
              ? adHocPriceError.message
              : "Polar ad-hoc pricing failed",
          debugInfo: {
            productId: process.env.POLAR_GENERIC_PRODUCT_ID,
            amount: finalAmount,
            currency: "USD",
            originalAmount: amount,
            originalCurrency: currency,
          },
          suggestion: "Use 'Cash on Delivery' payment method",
          fallbackAvailable: true,
        },
        { status: 503 }
      );
    }

    // Update payment record with checkout ID
    if (
      parsedMetadata.paymentId &&
      typeof parsedMetadata.paymentId === "string"
    ) {
      const updateData: UpdatePaymentData = {
        checkoutId: checkoutSession.id,
      };
      await PaymentService.updatePaymentStatus(
        parsedMetadata.paymentId,
        updateData
      );
    }

    // Redirect to Polar checkout

    return NextResponse.redirect(checkoutSession.url);
  } catch (error) {
    console.error("Polar checkout GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to create Polar checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
