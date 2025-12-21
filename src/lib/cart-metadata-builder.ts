import { type CartItemMetadata, type CartMetadata } from "@/types/polar";

// Type definition matching the Zod schema in src/schemas/polar-checkout.ts
export interface InputCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
  color?: string;
  size?: string;
  // Enhanced fields for better metadata
  productSlug?: string;
  imageUrl?: string;
  variantSku?: string;
  variantOptions?: string;
}

/**
 * Calculate cart total
 */
export function calculateCartTotal(cartItems: InputCartItem[]): number {
  return cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

/**
 * Build rich cart metadata for Polar
 */
export function buildCartMetadata(
  cartItems: InputCartItem[],
  orderId: string,
  customerEmail: string,
  options?: {
    userId?: string;
    customerName?: string;
    shipping?: number;
    tax?: number;
    discount?: number;
    deliveryAddress?: string;
    deliveryNotes?: string;
    currency?: string;
  }
): {
  cart: CartMetadata;
  orderType: "cart_purchase";
  timestamp: string;
  appVersion: string;
} {
  const currency = options?.currency ?? "MKD";

  // Calculate totals
  const subtotal = calculateCartTotal(cartItems);
  const shipping = options?.shipping ?? 0;
  const tax = options?.tax ?? 0;
  const discount = options?.discount ?? 0;
  const total = subtotal + shipping + tax - discount;

  // Map items to metadata format
  const items: CartItemMetadata[] = cartItems.map((item) => {
    const variantOptions = [item.size, item.color].filter(Boolean).join(", ");

    return {
      productId: item.productId,
      productName: item.title,
      productSlug: item.productSlug || "", // Use enhanced field
      variantId: item.variantId,
      variantSku: item.variantSku || "", // Use enhanced field
      variantOptions: item.variantOptions || variantOptions || undefined,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      currency: currency,
      imageUrl: item.imageUrl || "", // Use enhanced field
    };
  });

  return {
    cart: {
      orderId,
      userId: options?.userId,
      customerEmail,
      customerName: options?.customerName,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      currency,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      deliveryAddress: options?.deliveryAddress,
      deliveryNotes: options?.deliveryNotes,
    },
    orderType: "cart_purchase",
    timestamp: new Date().toISOString(),
    appVersion: "1.0.0",
  };
}

/**
 * Parse cart items handling both stringified (from webhook) and direct object formats
 */
export function parseCartItemsFromMetadata(
  metadataVal: string | object
): CartItemMetadata[] {
  if (!metadataVal) return [];

  try {
    const parsed: unknown =
      typeof metadataVal === "string" ? JSON.parse(metadataVal) : metadataVal;
    return Array.isArray(parsed) ? (parsed as CartItemMetadata[]) : [];
  } catch (e) {
    console.error("Failed to parse cart items from metadata", e);
    return [];
  }
}
