import { CartItem } from "@/context/CartContext";

import api from "@/lib/axios";

export const fetchCart = async (): Promise<CartItem[]> => {
  const res = await api.get<CartItem[]>("/cart");
  return res.data;
};

export const addToCart = async (item: CartItem) => {
  const res = await api.post("/cart", item);
  return res.data;
};

export const removeFromCart = async (itemId: string) => {
  await api.delete(`/cart?itemId=${itemId}`);
};

export const clearCart = async () => {
  await api.delete("/cart");
};
