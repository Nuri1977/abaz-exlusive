import { z } from "zod";

// Payment method enum schema
export const PaymentMethodSchema = z.enum([
  "CARD",
  "CASH_ON_DELIVERY",
  "BANK_TRANSFER",
  "DIGITAL_WALLET",
]);

// Payment status enum schema
export const PaymentStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "CASH_PENDING",
  "CASH_RECEIVED",
]);

// Order status enum schema
export const OrderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

// Zod schema for checkout input validation
export const PolarCheckoutInputSchema = z.object({
  // Amount in smallest currency unit (e.g., cents for USD, denars for MKD)
  amount: z.number().positive("Amount must be greater than 0"),

  // Currency code (ISO 4217) - always MKD for API processing
  currency: z.enum(["MKD", "USD", "EUR"]).default("MKD"),

  // Display currency (what user sees in UI)
  displayCurrency: z.enum(["MKD", "USD", "EUR"]).optional(),

  // Display amount (what user sees in UI)
  displayAmount: z.number().positive().optional(),

  // Payment method selection
  paymentMethod: PaymentMethodSchema.default("CARD"),

  // Customer information
  email: z.string().email("Invalid email address").optional(),

  // User ID from Better Auth session (optional for guest checkout)
  userId: z.string().optional(),

  // Order/cart information for metadata
  cartItems: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().positive(),
        price: z.number().positive(),
        title: z.string(),
        variantOptions: z
          .array(
            z.object({
              name: z.string(),
              value: z.string(),
            })
          )
          .optional(),
      })
    )
    .optional(),

  // Additional metadata
  customerName: z.string().optional(),
  phone: z.string().optional(),

  // Shipping information (optional for now)
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),

  // Cash payment specific fields
  deliveryNotes: z.string().optional(),
  deliveryDate: z.string().datetime().optional(),
});

export type PolarCheckoutInput = z.infer<typeof PolarCheckoutInputSchema>;

// Zod schema for checkout response
export const PolarCheckoutResponseSchema = z.object({
  url: z.string().url("Invalid checkout URL"),
  orderId: z.string().uuid().optional(),
  checkoutId: z.string().optional(),
  success: z.boolean().default(true),
});

export type PolarCheckoutResponse = z.infer<typeof PolarCheckoutResponseSchema>;

// Zod schema for webhook payload validation
export const PolarWebhookPayloadSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    customer_email: z.string().email().optional(),
    metadata: z.record(z.string()).optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type PolarWebhookPayload = z.infer<typeof PolarWebhookPayloadSchema>;

// Helper function to convert cart total to smallest currency unit
export function convertToSmallestUnit(
  amount: number,
  currency: string
): number {
  switch (currency) {
    case "USD":
    case "EUR":
      return Math.round(amount * 100); // Convert to cents
    case "MKD":
      return Math.round(amount); // MKD doesn't use fractional units typically
    default:
      return Math.round(amount * 100);
  }
}

// Helper function to convert from smallest currency unit to major unit
export function convertFromSmallestUnit(
  amount: number,
  currency: string
): number {
  switch (currency) {
    case "USD":
    case "EUR":
      return amount / 100; // Convert from cents
    case "MKD":
      return amount; // MKD doesn't use fractional units typically
    default:
      return amount / 100;
  }
}
