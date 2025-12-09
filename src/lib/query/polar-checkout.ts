import {
  PolarCheckoutInput,
  PolarCheckoutResponse,
} from "@/schemas/polar-checkout";

import api from "@/lib/axios";

/**
 * Initiate Polar checkout session
 */
export const initiatePolarCheckout = async (
  input: PolarCheckoutInput
): Promise<PolarCheckoutResponse> => {
  try {
    const response = await api.post<PolarCheckoutResponse>(
      "/polar/checkout",
      input
    );
    return response;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error: string } } };
    throw (
      error?.response?.data || { error: "Failed to create checkout session" }
    );
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
    const error = err as { response?: { data?: { error: string } } };
    throw error?.response?.data || { error: "Failed to fetch order status" };
  }
};
