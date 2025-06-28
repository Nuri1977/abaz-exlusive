import { CartItem } from "@/context/CartContext";
import { CheckoutFormValues } from "@/schemas/checkout";

import api from "@/lib/axios";

/**
 * Calls the /api/checkout endpoint to place an order.
 * For guests, pass cartItems explicitly. For logged-in users, cart is fetched server-side.
 */
export const checkout = async (
  form: CheckoutFormValues,
  cartItems?: CartItem[]
) => {
  try {
    const payload = cartItems ? { ...form, cartItems } : form;
    const res = await api.post("/checkout", payload);
    return res.data;
  } catch (err: any) {
    // Forward error for UI handling
    throw err?.response?.data || { error: "Unknown error" };
  }
};
