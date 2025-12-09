import { type CheckoutSessionData, type OrderMetadata } from "@/types/polar";

export class PolarService {
  /**
   * Prepare metadata for Polar checkout
   */
  static prepareCheckoutMetadata(
    sessionData: CheckoutSessionData,
    orderId: string,
    paymentId?: string
  ): OrderMetadata {
    return {
      userId: sessionData.userId,
      orderId,
      paymentId,
      cartSummary: {
        itemCount: sessionData.cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        totalAmount: sessionData.amount,
        currency: sessionData.currency,
      },
      productIds: sessionData.cartItems.map((item) => item.productId),
      variantIds: sessionData.cartItems
        .map((item) => item.variantId)
        .filter(Boolean) as string[],
      customerInfo: {
        email: sessionData.email,
        name: sessionData.customerName,
        phone: sessionData.phone,
      },
      environment: process.env.POLAR_ENVIRONMENT || "sandbox",
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Convert metadata to URL-encoded JSON string for Polar
   */
  static encodeMetadata(metadata: OrderMetadata): string {
    const stringifiedMetadata = Object.fromEntries(
      Object.entries(metadata).map(([key, value]) => [
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      ])
    );
    return encodeURIComponent(JSON.stringify(stringifiedMetadata));
  }

  /**
   * Generate checkout URL with query parameters for Polar NextJS handler
   */
  static generateCheckoutUrl(
    sessionData: CheckoutSessionData,
    orderId: string,
    paymentId: string,
    productId?: string
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutUrl = new URL(`${baseUrl}/api/polar/checkout`);

    // Add required parameters
    if (productId) {
      checkoutUrl.searchParams.set("products", productId);
    }

    if (sessionData.email) {
      checkoutUrl.searchParams.set("customerEmail", sessionData.email);
    }

    if (sessionData.customerName) {
      checkoutUrl.searchParams.set("customerName", sessionData.customerName);
    }

    if (sessionData.userId) {
      checkoutUrl.searchParams.set("customerId", sessionData.userId);
    }

    // Add metadata with paymentId
    const metadata = this.prepareCheckoutMetadata(
      sessionData,
      orderId,
      paymentId
    );
    const encodedMetadata = this.encodeMetadata(metadata);
    checkoutUrl.searchParams.set("metadata", encodedMetadata);

    return checkoutUrl.toString();
  }

  /**
   * Verify webhook signature (to be implemented with webhook handler)
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    // This will be implemented in the webhook handler using Polar's webhook verification
    // For now, return true - proper implementation will use POLAR_WEBHOOK_SECRET
    return true;
  }

  /**
   * Parse metadata from Polar webhook
   */
  static parseMetadata(
    metadata?: Record<string, string>
  ): Partial<OrderMetadata> {
    if (!metadata) return {};

    try {
      return {
        userId: metadata.userId,
        orderId: metadata.orderId,
        paymentId: metadata.paymentId, // Add paymentId extraction
        cartSummary: metadata.cartSummary
          ? JSON.parse(metadata.cartSummary)
          : undefined,
        productIds: metadata.productIds ? JSON.parse(metadata.productIds) : [],
        variantIds: metadata.variantIds ? JSON.parse(metadata.variantIds) : [],
        customerInfo: metadata.customerInfo
          ? JSON.parse(metadata.customerInfo)
          : {},
        environment: metadata.environment,
        createdAt: metadata.createdAt,
      };
    } catch (error) {
      console.error("Failed to parse metadata:", error);
      return {};
    }
  }
}
