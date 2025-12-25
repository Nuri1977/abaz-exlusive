import { type CartItem } from "@/context/CartContext";

import {
  type CheckoutCartItem,
  type CheckoutSessionData,
  type PaymentMethodType,
} from "@/types/polar";

/**
 * Convert cart items to checkout format
 */
export function convertCartItemsToCheckout(
  cartItems: CartItem[]
): CheckoutCartItem[] {
  return cartItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.price,
    title: item.title,
    variantOptions: item.variantOptions,
  }));
}

/**
 * Calculate total amount from cart items
 */
export function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

/**
 * Calculate total amount from checkout cart items
 */
export function calculateCheckoutCartTotal(
  cartItems: CheckoutCartItem[]
): number {
  return cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

/**
 * Prepare checkout session data from cart and user info (CartItem version)
 */
export function prepareCheckoutSessionData(
  cartItems: CartItem[],
  currency: string,
  paymentMethod: PaymentMethodType,
  userInfo?: {
    userId?: string;
    email?: string;
    name?: string;
    phone?: string;
  },
  addresses?: {
    shippingAddress?: string;
    billingAddress?: string;
  },
  deliveryInfo?: {
    deliveryNotes?: string;
  }
): CheckoutSessionData;

/**
 * Prepare checkout session data from checkout cart items (CheckoutCartItem version)
 */
export function prepareCheckoutSessionData(
  cartItems: CheckoutCartItem[],
  currency: string,
  paymentMethod: PaymentMethodType,
  userInfo?: {
    userId?: string;
    email?: string;
    name?: string;
    phone?: string;
  },
  addresses?: {
    shippingAddress?: string;
    billingAddress?: string;
  },
  deliveryInfo?: {
    deliveryNotes?: string;
  }
): CheckoutSessionData;

/**
 * Implementation
 */
export function prepareCheckoutSessionData(
  cartItems: CartItem[] | CheckoutCartItem[],
  currency: string,
  paymentMethod: PaymentMethodType,
  userInfo?: {
    userId?: string;
    email?: string;
    name?: string;
    phone?: string;
  },
  addresses?: {
    shippingAddress?: string;
    billingAddress?: string;
  },
  deliveryInfo?: {
    deliveryNotes?: string;
  }
): CheckoutSessionData {
  // Check if items are CartItem (have image property) or CheckoutCartItem
  const isCartItem = (item: CartItem | CheckoutCartItem): item is CartItem => {
    return "image" in item;
  };

  let checkoutItems: CheckoutCartItem[];
  let totalAmount: number;

  if (cartItems.length > 0) {
    const firstItem = cartItems[0];
    if (firstItem && isCartItem(firstItem)) {
      // Handle CartItem[]
      const cartItemsTyped = cartItems as CartItem[];
      checkoutItems = convertCartItemsToCheckout(cartItemsTyped);
      totalAmount = calculateCartTotal(cartItemsTyped);
    } else {
      // Handle CheckoutCartItem[]
      checkoutItems = cartItems as CheckoutCartItem[];
      totalAmount = calculateCheckoutCartTotal(checkoutItems);
    }
  } else {
    // Handle empty cart
    checkoutItems = [];
    totalAmount = 0;
  }

  return {
    amount: totalAmount,
    currency,
    paymentMethod,
    email: userInfo?.email,
    userId: userInfo?.userId,
    cartItems: checkoutItems,
    customerName: userInfo?.name,
    phone: userInfo?.phone,
    shippingAddress: addresses?.shippingAddress,
    billingAddress: addresses?.billingAddress,
    deliveryNotes: deliveryInfo?.deliveryNotes,
  };
}

/**
 * Validate checkout data before processing
 */
export function validateCheckoutData(sessionData: CheckoutSessionData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate amount
  if (!sessionData.amount || sessionData.amount <= 0) {
    errors.push("Invalid cart total amount");
  }

  // Validate currency
  if (!["MKD", "USD", "EUR"].includes(sessionData.currency)) {
    errors.push("Invalid currency");
  }

  // Validate payment method
  if (
    !["CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER", "DIGITAL_WALLET"].includes(
      sessionData.paymentMethod
    )
  ) {
    errors.push("Invalid payment method");
  }

  // Validate cart items
  if (!sessionData.cartItems || sessionData.cartItems.length === 0) {
    errors.push("Cart is empty");
  }

  // Validate cart items structure
  sessionData.cartItems?.forEach((item, index) => {
    if (!item.productId) {
      errors.push(`Cart item ${index + 1}: Missing product ID`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Cart item ${index + 1}: Invalid quantity`);
    }
    if (!item.price || item.price <= 0) {
      errors.push(`Cart item ${index + 1}: Invalid price`);
    }
    if (!item.title) {
      errors.push(`Cart item ${index + 1}: Missing product title`);
    }
  });

  // For guest checkout, email is required
  if (!sessionData.userId && !sessionData.email) {
    errors.push("Email is required for guest checkout");
  }

  // Cash payment specific validations
  if (sessionData.paymentMethod === "CASH_ON_DELIVERY") {
    // For cash payments, we need a delivery address (can be shipping address)
    if (!sessionData.shippingAddress) {
      errors.push("Delivery address is required for cash on delivery");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate order summary for display
 */
export function generateOrderSummary(cartItems: CartItem[], currency: string) {
  const subtotal = calculateCartTotal(cartItems);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // For now, we'll set shipping to 0, but this can be calculated based on location/method
  const shipping = 0;
  const tax = 0; // Tax calculation can be added later
  const total = subtotal + shipping + tax;

  return {
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
    currency,
    items: cartItems.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      variantOptions: item.variantOptions,
    })),
  };
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "MKD" ? 0 : 2,
    maximumFractionDigits: currency === "MKD" ? 0 : 2,
  });

  return formatter.format(amount);
}

/**
 * Generate unique order reference
 */
export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if payment method requires online processing (Polar)
 */
export function requiresOnlinePayment(paymentMethod: string): boolean {
  return ["CARD", "BANK_TRANSFER", "DIGITAL_WALLET"].includes(paymentMethod);
}

/**
 * Check if payment method is cash-based
 */
export function isCashPayment(paymentMethod: string): boolean {
  return paymentMethod === "CASH_ON_DELIVERY";
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplayName(paymentMethod: string): string {
  switch (paymentMethod) {
    case "CARD":
      return "Credit/Debit Card";
    case "CASH_ON_DELIVERY":
      return "Cash on Delivery";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "DIGITAL_WALLET":
      return "Digital Wallet";
    default:
      return paymentMethod;
  }
}

/**
 * Get payment status display name
 */
export function getPaymentStatusDisplayName(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAID":
      return "Paid";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    case "CASH_PENDING":
      return "Cash Payment Pending";
    case "CASH_RECEIVED":
      return "Cash Received";
    default:
      return status;
  }
}
