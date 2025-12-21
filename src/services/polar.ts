import { Polar } from "@polar-sh/sdk";

import type { OrderMetadata, PolarCheckoutMetadata } from "@/types/polar"; // Fix import type

export class PolarService {
  private static polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server:
      process.env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
  });

  /**
   * Create checkout using a generic product ID with a price override.
   * This is the hybrid approach to handle dynamic amounts with Polar.
   */
  static async createCustomAmountCheckout(
    genericProductId: string,
    amount: number,
    currency: string,
    metadata: PolarCheckoutMetadata,
    customerEmail: string,
    customerName?: string,
    successUrl?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cancelUrl?: string // Prefix unused var
  ) {
    try {
      // Convert amount to cents (Polar uses smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      // Prepare metadata for Polar (flatten complex objects)
      // Polar metadata values must be strings and cannot be empty
      const flatMetadata: Record<string, string> = {
        orderId: metadata.cart.orderId,
        userId: metadata.cart.userId || "guest", // Use "guest" instead of empty string
        orderType: metadata.orderType,
        itemCount: metadata.cart.itemCount.toString(),
        subtotal: metadata.cart.subtotal.toString(),
        total: metadata.cart.total.toString(),
        currency: metadata.cart.currency,
        timestamp: metadata.timestamp,

        // Enhanced product summary for Polar dashboard visibility
        productSummary: metadata.cart.items
          .map((item) => `${item.productName} (${item.quantity}x)`)
          .join(", "),

        // Store cart items as JSON string (flattened)
        cartItems: JSON.stringify(metadata.cart.items),

        // Store delivery info - use "none" instead of empty string
        deliveryAddress: metadata.cart.deliveryAddress || "none",
        deliveryNotes: metadata.cart.deliveryNotes || "none",

        // Store customer info
        customerName: metadata.cart.customerName || "Guest Customer",
        customerEmail: metadata.cart.customerEmail,
      };

      // Ensure success URL is valid
      if (!successUrl || successUrl.includes("undefined")) {
        throw new Error("Invalid success URL - NEXT_PUBLIC_APP_URL may not be configured");
      }

      // Create checkout session using the generic product and price override
      const checkoutData = {
        // 🎯 Use generic product ID
        products: [genericProductId],

        // 🎯 KEY: Use prices mapping for ad-hoc price creation
        prices: {
          [genericProductId]: [
            {
              amountType: "fixed" as const,
              priceAmount: amountInCents,
              priceCurrency: currency.toLowerCase(),
            },
          ],
        },

        // Customer information
        customerEmail: customerEmail,
        customerName: customerName || "Guest Customer",

        // URLs
        successUrl: successUrl,

        // Metadata
        metadata: flatMetadata,

        // Additional checkout options
        allowDiscountCodes: true,
        requireBillingAddress: false,
        allowTrial: true,
        isBusinessCustomer: false,
      };

      console.log("Creating Polar checkout with data:", JSON.stringify(checkoutData, null, 2));

      const checkout = await this.polar.checkouts.create(checkoutData);

      return {
        checkoutId: checkout.id,
        checkoutUrl: checkout.url,
        expiresAt: checkout.expiresAt,
      };
    } catch (error: unknown) {
      // Use unknown instead of any
      console.error("Polar checkout creation failed:", error);

      // Enhanced error logging for debugging
      if (error && typeof error === "object") {
        console.error("Error details:", {
          message: (error as any).message,
          statusCode: (error as any).statusCode,
          body: (error as any).body,
        });
      }

      // Check if it's an API error with details
      if (error && typeof error === "object" && "message" in error) {
        // Cast to simple object to access message safely
        const err = error as { message: string };
        throw new Error(`Polar API Error: ${err.message}`);
      }

      throw new Error("Failed to create payment checkout");
    }
  }

  /**
   * Get checkout details
   */
  static async getCheckout(checkoutId: string) {
    return await this.polar.checkouts.get({ id: checkoutId });
  }

  /**
   * Parse metadata from Polar webhook
   */
  static parseMetadata(
    metadata?: Record<string, string>
  ): Partial<OrderMetadata> {
    if (!metadata) return {};

    try {
      // Helper to safely parse JSON
      const safeParse = <T>(json?: string, fallback?: T): T | undefined => {
        if (!json) return fallback;
        try {
          return JSON.parse(json) as T;
        } catch {
          return fallback;
        }
      };

      return {
        userId: metadata.userId,
        orderId: metadata.orderId,
        paymentId: metadata.paymentId,
        cartSummary: safeParse(metadata.cartSummary),
        productIds: safeParse(metadata.productIds, []),
        variantIds: safeParse(metadata.variantIds, []),
        customerInfo: safeParse(metadata.customerInfo, {}),
        environment: metadata.environment,
        createdAt: metadata.createdAt,
      };
    } catch (error) {
      console.error("Failed to parse metadata:", error);
      return {};
    }
  }
}
