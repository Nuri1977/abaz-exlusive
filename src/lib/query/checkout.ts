import { type PolarCheckoutInput } from "@/schemas/polar-checkout";

import api from "@/lib/axios";

// Response types for checkout operations
export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  paymentId: string;
  url?: string; // For card payments (Polar checkout URL)
  paymentMethod: string;
  message?: string;
  order?: {
    id: string;
    total: number;
    currency: string;
    status: string;
    paymentStatus: string;
    deliveryDate?: string;
    deliveryNotes?: string;
  };
}

export interface CheckoutError {
  error: string;
  details?: Record<string, unknown>;
}

/**
 * Initiate checkout for any payment method
 * Routes to appropriate handler based on payment method
 */
export const initiateCheckout = async (
  input: PolarCheckoutInput
): Promise<CheckoutResponse> => {
  try {
    if (input.paymentMethod === "CASH_ON_DELIVERY") {
      // Use cash payment endpoint
      const response = await api.post<CheckoutResponse>(
        "/checkout/cash",
        input
      );
      return response;
    } else {
      // Use card payment endpoint (Polar) with extended timeout
      // Polar checkout can take 10-15 seconds due to external API calls
      const response = await api.post<CheckoutResponse>(
        "/polar/checkout",
        input,
        { timeout: 30000 } // 30 seconds timeout for Polar checkout
      );

      if (!response) {
        throw new Error("No response received from Polar checkout API");
      }

      return response;
    }
  } catch (err: unknown) {
    console.error("Checkout API error:", err);
    const error = err as {
      response?: {
        data?: CheckoutError & {
          fallbackAvailable?: boolean;
          suggestion?: string;
        };
      };
    };
    const errorData = error?.response?.data;

    // Create enhanced error with fallback information
    const enhancedError = new Error(
      errorData?.error || "Failed to initiate checkout"
    ) as Error & {
      fallbackAvailable?: boolean;
      suggestion?: string;
    };

    if (errorData?.fallbackAvailable) {
      enhancedError.fallbackAvailable = true;
    }

    if (errorData?.suggestion) {
      enhancedError.suggestion = errorData.suggestion;
    }

    throw enhancedError;
  }
};

/**
 * Create cash payment order
 */
export const createCashOrder = async (
  input: PolarCheckoutInput
): Promise<CheckoutResponse> => {
  try {
    const response = await api.post<CheckoutResponse>("/checkout/cash", input);
    return response;
  } catch (err: unknown) {
    const error = err as { response?: { data?: CheckoutError } };
    const errorData = error?.response?.data;
    throw new Error(errorData?.error || "Failed to create cash order");
  }
};

/**
 * Create card payment checkout (Polar)
 */
export const createCardCheckout = async (
  input: PolarCheckoutInput
): Promise<CheckoutResponse> => {
  try {
    const response = await api.post<CheckoutResponse>(
      "/polar/checkout",
      input,
      { timeout: 30000 } // 30 seconds timeout for Polar checkout
    );
    return response;
  } catch (err: unknown) {
    const error = err as { response?: { data?: CheckoutError } };
    const errorData = error?.response?.data;
    throw new Error(errorData?.error || "Failed to create card checkout");
  }
};

/**
 * Get order status by ID
 */
export const getOrderStatus = async (orderId: string) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  } catch (err: unknown) {
    const error = err as { response?: { data?: CheckoutError } };
    const errorData = error?.response?.data;
    throw new Error(errorData?.error || "Failed to get order status");
  }
};

/**
 * Validate checkout data before submission
 */
export const validateCheckoutInput = (
  input: PolarCheckoutInput
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Basic validation
  if (!input.amount || input.amount <= 0) {
    errors.push("Invalid amount");
  }

  if (!input.paymentMethod) {
    errors.push("Payment method is required");
  }

  if (!input.cartItems || input.cartItems.length === 0) {
    errors.push("Cart is empty");
  }

  // Payment method specific validation
  if (input.paymentMethod === "CASH_ON_DELIVERY") {
    if (!input.shippingAddress) {
      errors.push("Delivery address is required for cash on delivery");
    }
  }

  // Guest checkout validation
  if (!input.userId && !input.email) {
    errors.push("Email is required for guest checkout");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Legacy checkout function for backward compatibility
 * This function is used by the existing CheckoutPageClient component
 */
export const checkout = async (
  formValues: {
    name: string;
    email: string;
    phone: string;
    address: string;
    note?: string;
  },
  cartItems?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    title: string;
    image: string;
    variantOptions?: { name: string; value: string }[];
  }>
) => {
  // Convert legacy form data to new checkout format
  const checkoutInput: PolarCheckoutInput = {
    amount:
      cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
      0,
    currency: "MKD",
    paymentMethod: "CASH_ON_DELIVERY", // Default to cash for legacy checkout
    email: formValues.email,
    customerName: formValues.name,
    phone: formValues.phone,
    shippingAddress: formValues.address,
    deliveryNotes: formValues.note,
    cartItems:
      cartItems?.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        variantOptions: item.variantOptions,
      })) || [],
  };

  // Use the cash checkout endpoint for legacy compatibility
  return createCashOrder(checkoutInput);
};
